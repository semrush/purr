const util = require('util');

class CheckReport {
  /**
   * Create a check report.
   * @param {string} name - Check name
   * @param {string} id - Check id
   * @param {boolean} [success] - Success status
   * @param {string} [shortMessage] - Short message
   * @param {string} [fullMessage] - Full message
   * @param {string} [tracePath] - Trace path
   * @param {string} [screenshotPath] - Screenshot path
   * @param {string} [consoleLogPath] - Console log path
   * @param {string} [startDateTime] - Check start datetime
   * @param {string} [endDateTime] - Check completion datetime
   * @param {InstanceType<import('./action')['ActionReport']>[]} [actions=[]] - Check action list
   * @param {string|null} [scheduleName=null] - Schedule name
   * @param {string[]} [labels=[]] - Labels
   * @param {string[]} [forbiddenCookies=[]] - Found forbidden cookies
   * @param {number} [forbiddenCookiesCount=0] - Count of forbidden cookies found
   */
  constructor(
    name,
    id,
    success,
    shortMessage,
    fullMessage,
    tracePath,
    screenshotPath,
    consoleLogPath,
    startDateTime,
    endDateTime,
    actions = [],
    scheduleName = null,
    labels = [],
    forbiddenCookies = [],
    forbiddenCookiesCount = 0
  ) {
    this.name = name;
    this.id = id;
    this.success = success;
    this.shortMessage = shortMessage;
    this.fullMessage = fullMessage;
    this.tracePath = tracePath;
    this.screenshotPath = screenshotPath;
    this.consoleLogPath = consoleLogPath;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
    this.actions = actions;
    this.scheduleName = scheduleName;
    this.labels = labels;
    this.forbiddenCookies = forbiddenCookies;
    this.forbiddenCookiesCount = forbiddenCookiesCount;
  }
}

/**
 * Report view options.
 * @typedef {object} CheckReportViewOptions
 * @property {boolean} hideActions Indicates whether the actions should be showed.
 * @property {boolean} shorten Indicates whether the successful reports should be shorten.
 */

/**
 * Prepare report view.
 * @param {CheckReport} report Report instance
 * @param {CheckReportViewOptions} options View options
 * @returns {object}
 */
function processReport(report, options) {
  if (options && options.shorten && report.success === true) {
    const allowedKeys = [
      'name',
      'id',
      'success',
      'startDateTime',
      'endDateTime',
      'forbiddenCookies',
    ];

    const processed = Object.fromEntries(
      Object.entries(report).filter((entry) => {
        return allowedKeys.includes(entry[0]);
      })
    );

    return processed;
  }

  const processed = Object.fromEntries(
    Object.entries(report).filter((entry) => {
      if (options && options.hideActions && entry[0] === 'actions') {
        return false;
      }
      return true;
    })
  );

  return processed;
}

/**
 * Prepare report view.
 * @param {object} report Report
 * @returns {string}
 */
function stringifyReport(report) {
  return util.inspect(report, {
    colors: true,
    depth: null,
    maxArrayLength: null,
  });
}

module.exports = {
  CheckReport,
  processReport,
  stringifyReport,
};
