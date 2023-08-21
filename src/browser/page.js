const path = require('path');
const glob = require('glob');

const config = require('../config');
const log = require('../logger');

/**
 * Extension to add custom actions property.
 * @typedef PageCustomActions
 * @property {Record<string, unknown>} [actions]
 */

/**
 * Extends the puppeteer `Page` class to add custom properties.
 * @typedef {import('puppeteer').Page & PageCustomActions} PageExtended
 */

/**
 * Enables blocking of requests to specified domains
 *
 * @param {PageExtended} page
 * @param {String[]} domains List of domains to block
 */
async function BlockRequests(page, domains) {
  await page.setRequestInterception(true);

  page.on('request', (request) => {
    const url = new URL(request.url());

    if (domains.includes(url.host.toLowerCase())) {
      log.debug('Request blocked', { url: request.url() });
      request.abort();
    } else {
      request.continue(request.continueRequestOverrides(), 0).catch((err) => {
        log.error(
          `Could not continue request(${request.method()} ${request.url()}): `,
          err
        );
      });
    }
  });
}

/**
 * Get Puppeteer Page instance
 *
 * @param {import('puppeteer').Browser} browser Puppeteer Browser instance
 * @returns {Promise<PageExtended>}
 */
exports.getPage = async (browser) => {
  /** @type {PageExtended} */
  const page = await browser.newPage();
  page.actions = {};

  /** @type {import('../actions/context').ActionContext} */
  const context = { browser, page };

  glob.sync('../actions/**/*.js', { cwd: __dirname }).forEach((file) => {
    log.debug(`Actions file found: ${file}`);

    const objectPath = file.split(path.sep).slice(1, -1);

    // eslint-disable-next-line import/no-dynamic-require,global-require
    const actionsModule = require(file);

    page.actions[objectPath[1]] = {};

    Object.keys(actionsModule).forEach((actionFn) => {
      page.actions[objectPath[1]][actionFn] = (...args) =>
        actionsModule[actionFn](context, ...args);

      log.debug(`Action added: ${objectPath[1]}.${actionFn}`);
    });
  });

  if (config.blockedResourceDomains.length > 0) {
    await BlockRequests(page, config.blockedResourceDomains);
  }

  await page.setDefaultNavigationTimeout(config.navigationTimeout);

  return page;
};

module.exports = exports;
