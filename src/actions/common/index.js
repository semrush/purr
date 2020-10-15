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

module.exports = exports;
