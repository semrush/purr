const fs = require('fs');
const isEmpty = require('lodash.isempty');
const config = require('../../config');
const ReportPathsGenerator = require('../../report/pathGenerator');
const ReportURLReplacer = require('../../report/urlReplacer');
const { CheckData } = require('../../check/check');

class Reports {
  static get(req, res) {
    const generator = new ReportPathsGenerator(config);

    let name = req.params.id;
    if (config.artifactsGroupByCheckName) {
      if (isEmpty(req.query.name)) {
        res
          .status(400)
          .set({ 'Content-Type': 'application/json; charset=utf-8' })
          .send({
            code: 400,
            message:
              'Artifact group by name is enabled but check name in request query is empty.',
          });
        return;
      }
      name = req.query.name;
    }

    const paths = generator.get(
      new CheckData(name, req.params.id, null, null, [])
    );

    let report;
    try {
      report = JSON.parse(fs.readFileSync(paths.getReportPath(), 'utf8'));
    } catch (err) {
      res
        .status(404)
        .set({ 'Content-Type': 'application/json; charset=utf-8' })
        .send({
          code: 404,
          message: `Failed to parse file: ${err.message}`,
        });
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
        req.params.name,
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
      res
        .status(404)
        .set({ 'Content-Type': 'application/json; charset=utf-8' })
        .send({
          code: 404,
          message: `Failed to parse file: ${err.message}`,
        });
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
