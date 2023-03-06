const has = require('lodash.has');

class ReportURLReplacer {
  /**
   * @param {Configuration} config
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * @param {CheckReport} report
   * @param req
   * @returns {CheckReport}
   */
  replacePaths(report, req) {
    const current = report;
    if (has(report, 'tracePath') && report.tracePath) {
      current.tracePath = report.tracePath.replace(
        this.config.artifactsDir,
        `${req.protocol}://${req.headers.host}/storage`
      );
    }
    if (has(report, 'harPath') && report.harPath) {
      current.harPath = report.harPath.replace(
        this.config.artifactsDir,
        `${req.protocol}://${req.headers.host}/storage`
      );
    }
    if (has(report, 'screenshotPath') && report.screenshotPath) {
      current.screenshotPath = report.screenshotPath.replace(
        this.config.artifactsDir,
        `${req.protocol}://${req.headers.host}/storage`
      );
    }
    if (has(report, 'consoleLogPath') && report.consoleLogPath) {
      current.consoleLogPath = report.consoleLogPath.replace(
        this.config.artifactsDir,
        `${req.protocol}://${req.headers.host}/storage`
      );
    }
    return current;
  }
}

module.exports = ReportURLReplacer;
