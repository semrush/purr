const fs = require('fs');
const path = require('path');
const PuppeteerHar = require('puppeteer-har');

const { v4: uuidv4 } = require('uuid');
const Sentry = require('@sentry/node');

const config = require('../config');
const utils = require('../utils');
const log = require('../logger');
const { getBrowser } = require('../browser/browser');
const { getPage } = require('../browser/page');
const { ActionReport } = require('../report/action');
const { CheckReport } = require('../report/check');
const { CheckParser } = require('./parser');

function consoleLogToJSON(consoleLogsArray) {
  const seen = [];
  return JSON.stringify(
    consoleLogsArray,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.indexOf(value) !== -1) {
          // Duplicate reference found
          try {
            return JSON.parse(JSON.stringify(value));
          } catch (err) {
            return '...DEDUPED...';
          }
        }
        seen.push(value);
      }
      return value;
    },
    2
  );
}

function createDirIfNotExist(dirName) {
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }
}

class CheckRunner {
  constructor(queue = utils.mandatory('queue')) {
    this.checkParser = new CheckParser();

    if (typeof queue !== 'object') {
      throw new Error(
        `Queue should be instance of Queue, not '${typeof queue}'`
      );
    }
    this.queue = queue;
  }

  /**
   *
   * @param {import('../browser/page').PageExtended} page
   * @param {string} action Action name
   * @param {Array} params Action parameters
   */
  static async doAction(page, action, params = []) {
    const actionNested = action.split('.').slice();

    /** @type Function */
    let actionFunction;

    actionNested.forEach((element) => {
      if (!actionFunction) {
        actionFunction = page[element];
      } else {
        actionFunction = actionFunction[element];
      }
    });

    if (typeof actionFunction !== 'function') {
      throw new Error(`Action '${action}' does not exists`);
    }
    if (typeof params !== 'object') {
      throw new Error(`Action params should be array, not '${typeof params}'`);
    }

    return actionFunction.call(page, ...params);
  }

  /**
   * Execute check.
   * @param {string} name
   * @param {string} checkId
   * @param {object} [params={}]
   * @param {string|null} [scheduleName=null]
   * @param {string[]} [labels=[]]
   * @param {string|null} [proxy=null]
   * @param {string[]} [allowedCookies=[]]
   *
   * @returns {Promise<CheckReport>} Check report
   */
  async doCheck(
    name = utils.mandatory('name'),
    checkId = utils.mandatory('name'),
    params = {},
    scheduleName = null,
    labels = [],
    proxy = null,
    allowedCookies = []
  ) {
    if (typeof checkId !== 'string') {
      throw new Error(
        `Param checkId should be string, not '${typeof checkId}': ${checkId}`
      );
    }

    const scenarioCopy = this.checkParser.getScenario(name, params).slice();
    const checkReport = new CheckReport(name, checkId);
    const consoleLogsArray = [];

    checkReport.scheduleName = scheduleName;
    checkReport.labels = labels;

    const checkIdSafe = checkId.replace(/[^\w]/g, '_');

    let tracePath = `${checkIdSafe}_trace.json`;
    let harPath = `${checkIdSafe}.har`;
    let screenshotPath = `${checkIdSafe}_screenshot.png`;
    let consoleLogPath = `${checkIdSafe}_console.log`;
    let reportPath = `${checkIdSafe}_report.json`;

    const traceTempPath = path.resolve(config.tracesTempDir, tracePath);
    const harTempPath = path.resolve(config.harsTempDir, harPath);

    if (config.artifactsGroupByCheckName) {
      if (typeof config.artifactsDir === 'undefined') {
        throw new Error('Artifacts path not specified');
      }

      tracePath = path.resolve(config.artifactsDir, name, tracePath);
      harPath = path.resolve(config.artifactsDir, name, harPath);
      screenshotPath = path.resolve(config.artifactsDir, name, screenshotPath);
      consoleLogPath = path.resolve(config.artifactsDir, name, consoleLogPath);
      reportPath = path.resolve(config.artifactsDir, name, reportPath);
    } else {
      tracePath = path.resolve(config.tracesDir, tracePath);
      harPath = path.resolve(config.harsDir, harPath);
      screenshotPath = path.resolve(config.screenshotsDir, screenshotPath);
      consoleLogPath = path.resolve(config.consoleLogDir, consoleLogPath);
      reportPath = path.resolve(config.reportsDir, reportPath);
    }

    if (config.traces) {
      if (
        !config.artifactsGroupByCheckName &&
        typeof config.tracesDir === 'undefined'
      ) {
        throw new Error('Traces enabled but storage path not specified');
      }
      createDirIfNotExist(path.dirname(traceTempPath));
      createDirIfNotExist(path.dirname(tracePath));
    }

    if (config.hars) {
      if (
        !config.artifactsGroupByCheckName &&
        typeof config.harsDir === 'undefined'
      ) {
        throw new Error('HARs enabled but storage path not specified');
      }
      createDirIfNotExist(path.dirname(harTempPath));
      createDirIfNotExist(path.dirname(harPath));
    }

    if (config.screenshots) {
      if (
        !config.artifactsGroupByCheckName &&
        typeof config.screenshotsDir === 'undefined'
      ) {
        throw new Error('Screenshots enabled but storage path not specified');
      }
      createDirIfNotExist(path.dirname(screenshotPath));
    }

    if (config.consoleLog) {
      if (
        !config.artifactsGroupByCheckName &&
        typeof config.consoleLogDir === 'undefined'
      ) {
        throw new Error(
          'Console logging enabled but storage path not specified'
        );
      }
      createDirIfNotExist(path.dirname(consoleLogPath));
    }

    if (config.reports) {
      if (
        !config.artifactsGroupByCheckName &&
        typeof config.reportsDir === 'undefined'
      ) {
        throw new Error('Reports enabled but storage path not specified');
      }
      createDirIfNotExist(path.dirname(reportPath));
    }

    const check = this.checkParser.getParsedCheck(name);

    const browserArgs = [...config.chromiumLaunchArgs];

    if (typeof check.proxy !== 'undefined') {
      browserArgs.push(`--proxy-server=${check.proxy}`);
    } else if (proxy) {
      browserArgs.push(`--proxy-server=${proxy}`);
    }

    // TODO: do all actions in getBrowser().then and close browser after?
    const browser = await getBrowser(
      `${config.userAgent} (${JSON.stringify({
        checkId,
        name,
        scheduleName,
      })
        .replace(/["{}]/g, '')
        .replace(/,/g, '; ')})`,
      browserArgs
    );
    const page = await getPage(browser);

    if (config.traces) {
      checkReport.tracePath = tracePath;
      await page.tracing.start({
        path: traceTempPath,
        screenshots: true,
      });
    }

    let har;

    if (config.hars) {
      checkReport.harPath = harPath;
      har = new PuppeteerHar(page);
      await har.start({ path: harTempPath });
    }

    if (config.consoleLog) {
      page.on('console', (msg) => {
        consoleLogsArray.push(msg);
      });
    }

    let result = Promise.resolve().then(() => {
      checkReport.startDateTime = new Date().toISOString();
    });

    for (let step = 0; step < scenarioCopy.length; step += 1) {
      const [stepName, stepParameters] = scenarioCopy[step];

      result = result.then(async () => {
        const actionPromise = CheckRunner.doAction(
          page,
          stepName,
          stepParameters
        );

        const actionReport = new ActionReport(stepName, step, '***hidden***');
        actionReport.startDateTime = new Date().toISOString();

        await actionPromise
          .then(async () => {
            actionReport.success = true;

            if (config.cookieTracking) {
              await page
                .cookies()
                .then((cookies) => {
                  actionReport.cookies = cookies.map((cookie) => {
                    const { value, ...withoutValue } = cookie;
                    return withoutValue;
                  });
                })
                .catch((err) => {
                  log.error('Could not get a cookies: ', err);
                });
            }
          })
          .catch((err) => {
            actionReport.success = false;
            actionReport.shortMessage = err.message;
            actionReport.fullMessage = err;

            throw utils.enrichError(
              err,
              `Action '${stepName}' failed: ${err.message}`
            );
          })
          .finally(() => {
            actionReport.endDateTime = new Date().toISOString();
            checkReport.actions.push(actionReport);
          });
      });
    }

    result = result.then(async () => {
      checkReport.success = true;
      return Promise.resolve(checkReport);
    });
    result = result.catch(async (err) => {
      checkReport.success = false;
      checkReport.shortMessage = err.message;
      checkReport.fullMessage = err;
      return Promise.reject(checkReport);
    });

    result = result.finally(async () => {
      checkReport.endDateTime = new Date().toISOString();

      const forbiddenCookies = new Set();

      if (config.cookieTracking) {
        const allowedCookieNames = [];
        const allowedCookieRegexps = [];

        // Separate plain strings from regexps
        allowedCookies.forEach((allowedName) => {
          if (allowedName.startsWith('/')) {
            allowedCookieRegexps.push(utils.stringToRegExp(allowedName));
          } else {
            allowedCookieNames.push(allowedName);
          }
        });

        checkReport.actions.forEach((action) => {
          action.cookies.forEach((cookie) => {
            if (allowedCookieNames.includes(cookie.name)) {
              return;
            }

            if (
              allowedCookieRegexps.some((pattern) => pattern.test(cookie.name))
            ) {
              return;
            }

            forbiddenCookies.add(cookie.name);
          });
        });
      }

      checkReport.forbiddenCookies = [...forbiddenCookies];
      checkReport.forbiddenCookiesCount = forbiddenCookies.size;

      async function saveArtifacts() {
        if (config.traces) {
          try {
            await page.tracing.stop();
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not stop puppeteer tracing: ', err);
          }
        }

        if (config.hars) {
          try {
            await har.stop();
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not stop har generation: ', err);
          }
        }

        if (
          checkReport.success &&
          checkReport.forbiddenCookiesCount < 1 &&
          !config.artifactsKeepSuccessful
        ) {
          if (config.traces) {
            fs.unlinkSync(traceTempPath);
          }
          if (config.hars) {
            fs.unlinkSync(harTempPath);
          }
          return;
        }

        if (config.traces) {
          try {
            utils.moveFile(traceTempPath, tracePath);
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not save trace file: ', err);
          }
        }

        if (config.hars) {
          try {
            utils.moveFile(harTempPath, harPath);
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not save HAR file: ', err);
          }
        }

        if (config.screenshots) {
          checkReport.screenshotPath = screenshotPath;

          try {
            // TODO: try fullPage:false on error
            await page.screenshot({
              path: checkReport.screenshotPath,
              fullPage: true,
            });
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not take a screenshot: ', err);
          }
        }

        if (config.consoleLog) {
          checkReport.consoleLogPath = consoleLogPath;

          try {
            await fs.writeFileSync(
              checkReport.consoleLogPath,
              consoleLogToJSON(consoleLogsArray)
            );
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not write a console log to disk: ', err);
          }
        }

        if (config.reports) {
          try {
            await fs.writeFileSync(reportPath, JSON.stringify(checkReport));
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not write a report to disk: ', err);
          }
        }
      }

      try {
        await saveArtifacts();
      } catch (err) {
        Sentry.captureException(err);
        log.error('Can not write an artifacts to disk: ', err);
      } finally {
        browser.close();
      }
    });

    return result;
  }

  run(
    name = utils.mandatory('name'),
    checkId = uuidv4(),
    params = {},
    repeat = {},
    scheduleName = null,
    scheduleInterval = 0,
    wait = true,
    labels = [],
    proxy = null,
    allowedCookies = []
  ) {
    return this.queue.add(
      name,
      checkId,
      params,
      repeat,
      scheduleName,
      scheduleInterval,
      wait,
      labels,
      proxy,
      allowedCookies
    );
  }
}

module.exports = CheckRunner;
