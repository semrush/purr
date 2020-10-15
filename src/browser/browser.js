const puppeteer = require('puppeteer');

const config = require('../config');

/**
 * Returns Puppeteer Browser instance
 *
 * @param {string} userAgent Browser User Agent
 * @param {string[]} customArgs Additional arguments to pass to the browser instance
 * @returns {Promise<puppeteer.Browser>}
 */
exports.getBrowser = async (userAgent = config.userAgent, customArgs = []) => {
  return puppeteer.launch({
    // executablePath: 'google-chrome',
    // executablePath: 'google-chrome-unstable',
    // pipe: true,

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
};

module.exports = exports;
