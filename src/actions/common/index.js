const lighthouse = require('lighthouse');

const config = require('../../config');
const CheckReportCustomData = require('../../report/CheckReportCustomData');

/**
 * @param {HTMLElement} el
 */
function getInnerText(el) {
  return el.innerText;
}

/**
 * Checks that selector's innerText contains the target text
 *
 * @param {import('../context').ActionContext} context
 * @param {string} selector
 * @param {string} targetText
 */
exports.selectorContains = async (context, selector, targetText) => {
  await context.page.$eval(selector, getInnerText).then((content) => {
    if (content.includes(targetText)) {
      return;
    }
    throw new Error(`Element '${selector}' does not contain '${targetText}'`);
  });
};

/**
 * Checks that selector's innerText doesn't contain target text
 *
 * @param {import('../context').ActionContext} context
 * @param {string} selector
 * @param {string} targetText
 */
exports.selectorNotContains = async (context, selector, targetText) => {
  await context.page.$eval(selector, getInnerText).then((content) => {
    if (!content.includes(targetText)) {
      return;
    }
    throw new Error(`Element '${selector}' should not contain '${targetText}'`);
  });
};

/**
 * Logs lighthouse report performance metrics
 *
 * @param {import('../context').ActionContext} context
 * @param {string} id Id label for reported metrics
 * @param {string} url URL to measure
 *
 * @returns {Promise<CheckReportCustomData>}
 */
exports.runLighthouse = async (context, id, url) => {
  if (config.traces) {
    throw new Error(
      'Lighthouse can be called only if tracing feature is disabled'
    );
  }

  const result = await lighthouse(url, {
    port: config.chromiumRemoteDebuggingPort,
    onlyCategories: ['performance'],
  });
  const { lhr } = result;

  const customReport = new CheckReportCustomData();
  customReport.metrics = [
    {
      value: lhr.audits['first-contentful-paint'].numericValue,
      labels: { name: 'first-contentful-paint', id },
    },
    {
      value: lhr.audits['largest-contentful-paint'].numericValue,
      labels: { name: 'largest-contentful-paint', id },
    },
    {
      value: lhr.audits['first-meaningful-paint'].numericValue,
      labels: { name: 'first-meaningful-paint', id },
    },
    {
      value: lhr.audits['speed-index'].numericValue,
      labels: { name: 'speed-index', id },
    },
    {
      value: lhr.audits['server-response-time'].numericValue,
      labels: { name: 'server-response-time', id },
    },
    {
      value: lhr.audits.interactive.numericValue,
      labels: { name: 'interactive', id },
    },
    {
      value: lhr.audits['total-blocking-time'].numericValue,
      labels: { name: 'total-blocking-time', id },
    },
    {
      value: lhr.audits['cumulative-layout-shift'].numericValue,
      labels: { name: 'cumulative-layout-shift', id },
    },
  ];
  return customReport;
};

/**
 * Logs browser performance metrics
 *
 * @param {import('../context').ActionContext} context
 * @param {string} id Id label for reported metrics
 *
 * @returns {Promise<CheckReportCustomData>}
 */
exports.logPerformanceMetrics = async (context, id) => {
  const firstPaint = JSON.parse(
    await context.page.evaluate(() =>
      JSON.stringify(window.performance.getEntriesByName('first-paint'))
    )
  );

  const firstContentfulPaint = JSON.parse(
    await context.page.evaluate(() =>
      JSON.stringify(
        window.performance.getEntriesByName('first-contentful-paint')
      )
    )
  );

  const windowPerformance = JSON.parse(
    await context.page.evaluate(() =>
      JSON.stringify(window.performance.toJSON())
    )
  );

  const customReport = new CheckReportCustomData();
  customReport.metrics = [
    {
      value: firstPaint[0].startTime,
      labels: { name: 'first-paint', id },
    },
    {
      value: firstContentfulPaint[0].startTime,
      labels: { name: 'first-contentful-paint', id },
    },
    {
      value:
        windowPerformance.timing.domainLookupEnd -
        windowPerformance.timing.domainLookupStart,
      labels: { name: 'domain-lookup', id },
    },
    {
      value:
        windowPerformance.timing.connectEnd -
        windowPerformance.timing.connectStart,
      labels: { name: 'connect', id },
    },
    {
      value:
        windowPerformance.timing.responseStart -
        windowPerformance.timing.requestStart,
      labels: { name: 'server-response-time', id },
    },
  ];
  return customReport;
};

module.exports = exports;
