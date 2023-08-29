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
const ReportPathsGenerator = require('../report/pathGenerator');
const { CheckParser } = require('./parser');
const CheckReportCustomData = require('../report/CheckReportCustomData');
const { CheckData } = require('./check');

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

    const rpg = new ReportPathsGenerator(config);
    const paths = rpg.get(
      new CheckData(name, checkId, params, scheduleName, labels)
    );

    if (config.traces) {
      createDirIfNotExist(path.dirname(paths.getTracePath()));
      createDirIfNotExist(path.dirname(paths.getTraceTempPath()));
    }

    if (config.hars) {
      createDirIfNotExist(path.dirname(paths.getHarPath()));
      createDirIfNotExist(path.dirname(paths.getHarTempPath()));
    }

    if (config.screenshots) {
      createDirIfNotExist(path.dirname(paths.getScreenshotPath()));
    }

    if (config.consoleLog) {
      createDirIfNotExist(path.dirname(paths.getConsoleLogPath()));
    }

    if (config.reports) {
      createDirIfNotExist(path.dirname(paths.getReportPath()));
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
      checkReport.tracePath = paths.getTracePath();
      await page.tracing.start({
        path: paths.getTraceTempPath(),
        screenshots: true,
      });
    }

    let har;

    if (config.hars) {
      checkReport.harPath = paths.getHarPath();
      har = new PuppeteerHar(page);
      await har.start({ path: paths.getHarTempPath() });
    }

    if (config.consoleLog) {
      page.on('console', (msg) => {
        consoleLogsArray.push(msg.text());
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
          .then(async (actionResult) => {
            actionReport.success = true;

            if (actionResult instanceof CheckReportCustomData) {
              checkReport.metrics.push(...actionResult.metrics);
            }

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
            fs.unlinkSync(paths.getTraceTempPath());
          }
          if (config.hars) {
            fs.unlinkSync(paths.getHarTempPath());
          }
          return;
        }

        if (config.traces) {
          try {
            utils.moveFile(paths.getTraceTempPath(), paths.getTracePath());
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not save trace file: ', err);
          }
        }

        if (config.hars) {
          try {
            utils.moveFile(paths.getHarTempPath(), paths.getHarPath());
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not save HAR file: ', err);
          }
        }

        if (config.screenshots) {
          checkReport.screenshotPath = paths.getScreenshotPath();

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
          checkReport.consoleLogPath = paths.getConsoleLogPath();

          try {
            await fs.writeFileSync(
              checkReport.consoleLogPath,
              JSON.stringify(consoleLogsArray)
            );
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not write a console log to disk: ', err);
          }
        }

        if (config.reports) {
          try {
            await fs.writeFileSync(
              paths.getReportPath(),
              JSON.stringify(checkReport)
            );
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not write a report to disk: ', err);
          }
          if (config.latestFailedReports && checkReport.success === false) {
            try {
              await fs.writeFileSync(
                paths.getLatestFailedReportPath(),
                JSON.stringify(checkReport)
              );
            } catch (err) {
              Sentry.captureException(err);
              log.error('Can not write a latest failed report to disk: ', err);
            }
          }
        }
      }

      try {
        await saveArtifacts();
      } catch (err) {
        Sentry.captureException(err);
        log.error('Can not write an artifacts to disk: ', err);
      } finally {
        if (page && page.browser === 'function') {
          const downstreamBrowser = page.browser();
          try {
            await page.close();
          } catch (e) {
            log.error('Failed to close page: ', e);
          }
          await downstreamBrowser.close();
        }
        await browser.close();
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
