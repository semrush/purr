const puppeteer = require('puppeteer');

const config = require('../config');
const log = require('../logger');

/**
 * Returns Puppeteer Browser instance
 *
 * @param {string} userAgent Browser User Agent
 * @param {string[]} customArgs Additional arguments to pass to the browser instance
 * @returns {Promise<puppeteer.Browser>}
 */
exports.getBrowser = async (userAgent = config.userAgent, customArgs = []) => {
  const args = [
    `--window-size=${config.windowWidth},${config.windowHeight}`,
    `--user-agent=${userAgent}`,
    '--no-sandbox',
    '--disk-cache-size=0',
    ...customArgs,
  ];

  if (config.chromiumRemoteDebugging) {
    if (config.concurrency > 1) {
      throw new Error(
        'chromiumRemoteDebugging config option is not compatible with concurrency > 1'
      );
    }

    args.push(
      `--remote-debugging-address=${config.chromiumRemoteDebuggingAddress}`,
      `--remote-debugging-port=${config.chromiumRemoteDebuggingPort}`
    );
  }

  log.debug('Lauching browser with args', { args });
  return puppeteer.launch({
    // executablePath: 'google-chrome',
    // executablePath: 'google-chrome-unstable',
    // pipe: true,

    args,

    defaultViewport: {
      width: config.windowWidth,
      height: config.windowHeight,
    },

    // We want to handle it manually in bull workers
    handleSIGTERM: false,
    handleSIGINT: false,
    handleSIGHUP: false,

    dumpio: true,
    // headless: false,
  });
};

module.exports = exports;
