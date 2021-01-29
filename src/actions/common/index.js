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
