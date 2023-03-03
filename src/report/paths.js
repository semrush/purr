const isEmpty = require('lodash.isempty');

class ReportPaths {
  /**
   * @param {string} tracePath
   * @param {string} traceTempPath
   * @param {string} harPath
   * @param {string} harTempPath
   * @param {string} screenshotPath
   * @param {string} consoleLogPath
   * @param {string} reportPath
   * @param {string} latestFailedReportPath
   */
  constructor(
    tracePath,
    traceTempPath,
    harPath,
    harTempPath,
    screenshotPath,
    consoleLogPath,
    reportPath,
    latestFailedReportPath
  ) {
    this.tracePath = tracePath;
    this.traceTempPath = traceTempPath;
    this.harPath = harPath;
    this.harTempPath = harTempPath;
    this.screenshotPath = screenshotPath;
    this.consoleLogPath = consoleLogPath;
    this.reportPath = reportPath;
    this.latestFailedReportPath = latestFailedReportPath;
  }

  /**
   * @returns {string}
   */
  getTracePath() {
    if (isEmpty(this.tracePath)) {
      throw Error('Trace path is empty');
    }
    return this.tracePath;
  }

  /**
   * @returns {string}
   */
  getTraceTempPath() {
    if (isEmpty(this.traceTempPath)) {
      throw Error('Trace temp path is empty');
    }
    return this.traceTempPath;
  }

  /**
   * @returns {string}
   */
  getHarPath() {
    if (isEmpty(this.harPath)) {
      throw Error('Har path is empty');
    }
    return this.harPath;
  }

  /**
   * @returns {string}
   */
  getHarTempPath() {
    if (isEmpty(this.harTempPath)) {
      throw Error('Har temp path is empty');
    }
    return this.harTempPath;
  }

  /**
   * @returns {string}
   */
  getScreenshotPath() {
    if (isEmpty(this.screenshotPath)) {
      throw Error('Screenshot path is empty');
    }
    return this.screenshotPath;
  }

  /**
   * @returns {string}
   */
  getConsoleLogPath() {
    if (isEmpty(this.consoleLogPath)) {
      throw Error('ConsoleLog path is empty');
    }
    return this.consoleLogPath;
  }

  /**
   * @returns {string}
   */
  getReportPath() {
    if (isEmpty(this.reportPath)) {
      throw Error('Report path is empty');
    }
    return this.reportPath;
  }

  /**
   * @returns {string}
   */
  getLatestFailedReportPath() {
    if (isEmpty(this.latestFailedReportPath)) {
      throw Error('Latest failed report path is empty');
    }
    return this.latestFailedReportPath;
  }
}

module.exports = ReportPaths;
