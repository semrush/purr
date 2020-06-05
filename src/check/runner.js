const fs = require('fs');
const puppeteer = require('puppeteer');

const { v4: uuidv4 } = require('uuid');
const Sentry = require('@sentry/node');

const config = require('../config');
const utils = require('../utils');
const Logger = require('../Logger');
const { CheckReport, ActionReport } = require('./report');
const { CheckParser } = require('./parser');

const log = new Logger();

async function getBrowser(userAgent = config.userAgent, customArgs = []) {
  return puppeteer.launch({
    args: [
      `--window-size=${config.windowWidth},${config.windowHeight}`,
      `--user-agent=${userAgent}`,
      '--no-sandbox',
      '--disk-cache-size=0',
      ...customArgs,
    ],

    defaultViewport: {
      width: config.windowWidth,
      height: config.windowHeight,
    },

    // We want to handle it manually in bull workers
    handleSIGTERM: false,
    handleSIGINT: false,
    handleSIGHUP: false,

    // headless: false,
  });
}

async function getPage(browser = utils.mandatory('browser')) {
  const page = await browser.newPage();

  if (config.blockedResourceDomains.length > 0) {
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      const url = new URL(request.url());

      if (config.blockedResourceDomains.includes(url.host.toLowerCase())) {
        log.info(`blocked ${request.url()}`);
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  await page.setDefaultNavigationTimeout(config.navigationTimeout);
  return page;
}

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

function prepareArtifactsDirs() {
  if (config.traces) {
    if (typeof config.tracesDir === 'undefined') {
      throw new Error('Traces enabled but storage path not specified');
    }
    if (!fs.existsSync(config.tracesDir)) {
      fs.mkdirSync(config.tracesDir, { recursive: true });
    }
  }

  if (config.screenshots) {
    if (typeof config.screenshotsDir === 'undefined') {
      throw new Error('Screenshots enabled but storage path not specified');
    }
    if (!fs.existsSync(config.screenshotsDir)) {
      fs.mkdirSync(config.screenshotsDir, { recursive: true });
    }
  }

  if (config.consoleLog) {
    if (typeof config.consoleLogDir === 'undefined') {
      throw new Error('Console logging enabled but storage path not specified');
    }
    if (!fs.existsSync(config.consoleLogDir)) {
      fs.mkdirSync(config.consoleLogDir, { recursive: true });
    }
  }
}

class CheckRunner {
  constructor(queue = utils.mandatory('queue')) {
    prepareArtifactsDirs();

    this.checkParser = new CheckParser();

    if (typeof queue !== 'object') {
      throw new Error(
        `Queue should be instance of Queue, not '${typeof queue}'`
      );
    }
    this.queue = queue;
  }

  static async doAction(
    page = utils.mandatory('page'),
    action = utils.mandatory('action'),
    params = []
  ) {
    if (typeof page[action] !== 'function') {
      throw new Error(`Action '${action}' does not exists`);
    }
    if (typeof params !== 'object') {
      throw new Error(`Action params should be array, not '${typeof params}'`);
    }

    return page[action](...params);
  }

  /**
   * Execute check.
   * @param {string} name
   * @param {string} checkId
   * @param {object} [params={}]
   * @param {string} [scheduleName='']
   * @param {string[]} [labels=[]]
   * @param {string|null} [proxy=null]
   * @param {string[]} [cookieWhitelist=[]]
   *
   * @returns {Promise<CheckReport>} Check report
   */
  async doCheck(
    name = utils.mandatory('name'),
    checkId = utils.mandatory('name'),
    params = {},
    scheduleName = '',
    labels = [],
    proxy = null,
    cookieWhitelist = []
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

    const check = this.checkParser.getParsedCheck(name);

    const browserArgs = [];

    if (typeof check.proxy !== 'undefined') {
      browserArgs.push(`--proxy-server=${check.proxy}`);
    } else if (proxy) {
      browserArgs.push(`--proxy-server=${proxy}`);
    }

    // TODO: do all actions in getBrowser().then and close browser after?
    const browser = await getBrowser(
      `${config.userAgent} (checkId: ${checkId}; checkName: ${name};)`,
      browserArgs
    );
    const page = await getPage(browser);

    const checkIdSafe = checkId.replace(/[^\w]/g, '_');

    if (config.traces) {
      checkReport.tracePath = `${config.tracesDir}/trace_${name}_${checkIdSafe}.json`;
      await page.tracing.start({
        path: checkReport.tracePath,
        screenshots: true,
      });
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
                  log.error('Could not get a cookies:', err);
                });
            }

            if (
              stepName === 'waitForSelector' &&
              typeof stepParameters[1] !== 'undefined' &&
              (typeof stepParameters[1].contains !== 'undefined' ||
                typeof stepParameters[1].notContains !== 'undefined')
            ) {
              await page
                .$eval(stepParameters[0], (el) => {
                  return el.innerText;
                })
                .then((content) => {
                  if (!content.includes(stepParameters[1].contains)) {
                    throw new Error(
                      `Element '${stepParameters[0]}' does not contains '${stepParameters[1].contains}'`
                    );
                  } else if (content.includes(stepParameters[1].notContains)) {
                    throw new Error(
                      `Element '${stepParameters[0]}' should not contains '${stepParameters[1].notContains}'`
                    );
                  }
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
        const cookieWhitelistNames = [];
        const cookieWhitelistRegexps = [];

        // Separate plain strings from regexps
        cookieWhitelist.forEach((whitelistedName) => {
          if (whitelistedName.startsWith('/')) {
            cookieWhitelistRegexps.push(utils.stringToRegExp(whitelistedName));
          } else {
            cookieWhitelistNames.push(whitelistedName);
          }
        });

        checkReport.actions.forEach((action) => {
          action.cookies.forEach((cookie) => {
            if (cookieWhitelistNames.includes(cookie.name)) {
              return;
            }

            if (
              cookieWhitelistRegexps.some((pattern) =>
                pattern.test(cookie.name)
              )
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
            log.error('Can not stop puppeteer tracing:', err);
          }
        }

        if (config.screenshots) {
          checkReport.screenshotPath = `${config.screenshotsDir}/screenshot_${name}_${checkIdSafe}.png`;

          try {
            // TODO: try fullPage:false on error
            await page.screenshot({
              path: checkReport.screenshotPath,
              fullPage: true,
            });
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not take a screenshot:', err);
          }
        }

        if (config.consoleLog) {
          checkReport.consoleLogPath = `${config.consoleLogDir}/console_${name}_${checkIdSafe}.log`;

          try {
            await fs.writeFileSync(
              checkReport.consoleLogPath,
              consoleLogToJSON(consoleLogsArray)
            );
          } catch (err) {
            Sentry.captureException(err);
            log.error('Can not write a console log to disk:', err);
          }
        }
      }

      try {
        await saveArtifacts();
      } catch (err) {
        Sentry.captureException(err);
        log.error('Can not write an artifacts to disk:', err);
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
    scheduleName = '',
    scheduleInterval = 0,
    wait = true,
    labels = [],
    proxy = null,
    cookieWhitelist = []
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
      cookieWhitelist
    );
  }
}

module.exports = CheckRunner;
