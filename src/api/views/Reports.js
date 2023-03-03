const fs = require('fs');

const config = require('../../config');
const ReportPathsGenerator = require('../../report/pathGenerator');
const ReportURLReplacer = require('../../report/urlReplacer');
const { CheckData } = require('../../check/check');

class Reports {
  static get(req, res) {
    const generator = new ReportPathsGenerator(config);
    const paths = generator.get(
      new CheckData(req.params.id, req.params.id, null, null, [])
    );

    let report;
    try {
      report = JSON.parse(fs.readFileSync(paths.getReportPath(), 'utf8'));
    } catch (err) {
      res.status(404).end();
      return;
    }

    const replacer = new ReportURLReplacer(config);
    report = replacer.replacePaths(report, req);
    res
      .set({ 'Content-Type': 'application/json; charset=utf-8' })
      .send(
        req.query.view === 'pretty' ? JSON.stringify(report, null, 2) : report
      );
  }

  static failed(req, res) {
    const generator = new ReportPathsGenerator(config);
    const paths = generator.get(
      new CheckData(
        req.params.name,
        req.query.id ? req.query.id : req.params.name,
        null,
        req.query.schedule,
        []
      )
    );

    let report;
    try {
      report = JSON.parse(
        fs.readFileSync(paths.getLatestFailedReportPath(), 'utf8')
      );
    } catch (err) {
      res.status(404).end();
      return;
    }

    const replacer = new ReportURLReplacer(config);
    report = replacer.replacePaths(report, req);
    res
      .set({ 'Content-Type': 'application/json; charset=utf-8' })
      .send(
        req.query.view === 'pretty' ? JSON.stringify(report, null, 2) : report
      );
  }
}

module.exports = Reports;
