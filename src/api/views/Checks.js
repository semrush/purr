const uuidv4 = require('uuid/v4');

const Logger = require('../../Logger');
const config = require('../../config');
const { CheckParser } = require('../../check/parser');
const CheckRunner = require('../../check/runner');
const RedisQueue = require('../../queue/RedisQueue');

const log = new Logger();

class Checks {
  static list(req, res) {
    res.send(new CheckParser().getList());
  }

  static exec(req, res, next) {
    const queue = new RedisQueue(config.checksQueueName);
    const checkRunner = new CheckRunner(queue);
    const checkId = uuidv4();
    const { query, params, body } = req;

    // TODO: body.params is not secure?
    const checkJob = checkRunner.run(params.name, checkId, body.params);
    let isRequestComplete = false;

    if (query.wait === 'true') {
      const responseTimeout = setTimeout(() => {
        if (isRequestComplete) {
          return;
        }

        isRequestComplete = true;

        const errMessage = `Check waiting timeout exceeded. Id: ${checkId}`;

        log.info(errMessage);

        res.status(408).json({
          status: 'error',
          error: errMessage,
        });
      }, config.apiWaitTimeout);

      checkJob
        .then(async (report) => {
          if (isRequestComplete) {
            return;
          }

          isRequestComplete = true;

          const result = { report };

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
        })
        .catch(next)
        .finally(() => {
          clearTimeout(responseTimeout);
          queue.close();
        });
    } else {
      queue.close();
      res
        .status(202)
        .location(`${config.apiUrlPrefix}/reports/${checkId}`)
        .send({ id: checkId });
    }
  }
}

module.exports = Checks;
