const fs = require('fs');

const config = require('../../config');

class Reports {
  static get(req, res) {
    const { query } = req;
    const checkIdSafe = req.params.id.replace(/[^\w]/g, '_');
    let report;

    try {
      report = JSON.parse(
        fs.readFileSync(
          `${config.reportsDir}/report_${checkIdSafe}.json`,
          'utf8'
        )
      );
    } catch (err) {
      res.status(404).end();
    }

    if (report.tracePath) {
      report.tracePath = report.tracePath.replace(
        config.artifactsDir,
        `${req.protocol}://${req.headers.host}/storage`
      );
    }
    if (report.screenshotPath) {
      report.screenshotPath = report.screenshotPath.replace(
        config.artifactsDir,
        `${req.protocol}://${req.headers.host}/storage`
      );
    }
    if (report.consoleLogPath) {
      report.consoleLogPath = report.consoleLogPath.replace(
        config.artifactsDir,
        `${req.protocol}://${req.headers.host}/storage`
      );
    }

    res
      .set({ 'Content-Type': 'application/json; charset=utf-8' })
      .send(query.view === 'pretty' ? JSON.stringify(report, null, 2) : report);
  }
}

module.exports = Reports;
