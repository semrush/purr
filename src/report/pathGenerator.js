const path = require('path');
const filter = require('lodash.filter');
const ReportPaths = require('./paths');

class ReportPathsGenerator {
  /**
   * @param {Configuration} config
   */
  constructor(config) {
    this.config = config;
  }

  /**
   *
   * @param {CheckData} check
   * @returns {ReportPaths}
   */
  get(check) {
    let tracePath;
    let harPath;
    let screenshotPath;
    let consoleLogPath;
    let reportPath;

    switch (this.config.artifactsGroupByCheckName) {
      case true:
        tracePath = path.resolve(this.config.artifactsDir, check.name);
        harPath = path.resolve(this.config.artifactsDir, check.name);
        screenshotPath = path.resolve(this.config.artifactsDir, check.name);
        consoleLogPath = path.resolve(this.config.artifactsDir, check.name);
        reportPath = path.resolve(this.config.artifactsDir, check.name);
        break;
      case false:
      default:
        tracePath = path.resolve(this.config.tracesDir);
        harPath = path.resolve(this.config.harsDir);
        screenshotPath = path.resolve(this.config.screenshotsDir);
        consoleLogPath = path.resolve(this.config.consoleLogDir);
        reportPath = path.resolve(this.config.reportsDir);
        break;
    }

    const traceTempPath = path.resolve(this.config.tracesTempDir);
    const harTempPath = path.resolve(this.config.harsTempDir);

    const checkId = check.id.replace(/[^\w]/g, '_');
    const checkName = check.name.replace(/[^\w]/g, '_');
    const latestFailedReportFile = filter([checkName, check.scheduleName]).join(
      '_'
    );

    return new ReportPaths(
      path.resolve(tracePath, `${checkId}_trace.json`),
      path.resolve(traceTempPath, `${checkId}_trace.json`),
      path.resolve(harPath, `${checkId}.har`),
      path.resolve(harTempPath, `${checkId}.har`),
      path.resolve(screenshotPath, `${checkId}_screenshot.png`),
      path.resolve(consoleLogPath, `${checkId}_console.log`),
      path.resolve(reportPath, `${checkId}_report.json`),
      path.resolve(
        reportPath,
        `${latestFailedReportFile}_latest_failed_report.json`
      )
    );
  }
}

module.exports = ReportPathsGenerator;
