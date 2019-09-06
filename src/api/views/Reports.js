const config = require('../../config');
const RedisQueue = require('../../queue/RedisQueue');

class Reports {
  static get(req, res, next) {
    const queue = new RedisQueue(config.checksQueueName);
    const checkId = req.params.id;
    const { query } = req;

    queue.bull
      .getJob(checkId)
      .then(async (job) => {
        if (job == null) {
          res.status(404).end();
        } else {
          const result = {
            state: await job.getState(),
            report: job.returnvalue,
          };

          if (result.report.tracePath) {
            result.report.tracePath = result.report.tracePath.replace(
              config.artifactsDir,
              `${req.protocol}://${req.headers.host}/storage`
            );
          }
          if (result.report.screenshotPath) {
            result.report.screenshotPath = result.report.screenshotPath.replace(
              config.artifactsDir,
              `${req.protocol}://${req.headers.host}/storage`
            );
          }
          if (result.report.consoleLogPath) {
            result.report.consoleLogPath = result.report.consoleLogPath.replace(
              config.artifactsDir,
              `${req.protocol}://${req.headers.host}/storage`
            );
          }

          res
            .set({ 'Content-Type': 'application/json; charset=utf-8' })
            .send(
              query.view === 'pretty' ? JSON.stringify(result, null, 2) : result
            );
        }
      })
      .catch(next)
      .finally(() => {
        queue.close();
      });
  }
}

module.exports = Reports;
