const util = require('util');

const checkReport = require('./check');

class SuiteReport {
  /**
   * Create a suite report.
   * @param {string} name Suite name
   * @param {string} id Suite id
   * @param {boolean} [success] Success status
   * @param {string} [shortMessage] Short message
   * @param {string} [fullMessage] Full message
   * @param {string} [startDateTime] Suite start datetime
   * @param {string} [endDateTime] Suite completion datetime
   * @param {InstanceType<import('./check')['CheckReport']>[]} [checks=[]] Suite check list
   */
  constructor(
    name,
    id,
    success,
    shortMessage,
    fullMessage,
    startDateTime,
    endDateTime,
    checks = []
  ) {
    this.name = name;
    this.id = id;
    this.success = success;
    this.shortMessage = shortMessage;
    this.fullMessage = fullMessage;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
    this.checks = checks;
  }
}
/**
 * Report view options.
 * @typedef {object} SuiteReportViewOptions
 * @property {import('./check').CheckReportViewOptions} reportOptions .
 */

/**
 * Prepare report view.
 * @param {SuiteReport} report Report instance
 * @param {SuiteReportViewOptions} options View options
 * @returns {object}
 */
function processReport(report, options) {
  const processedCheckReports = report.checks.map((origCheckReport) => {
    return checkReport.processReport(origCheckReport, options.reportOptions);
  });

  const processed = { ...report, checks: processedCheckReports };

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
  SuiteReport,
  processReport,
  stringifyReport,
};
