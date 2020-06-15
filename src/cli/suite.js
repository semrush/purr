const config = require('../config');
const Logger = require('../Logger');
const SuiteRunner = require('../suite/runner');
const { processReport, stringifyReport } = require('../report/suite');
const RedisQueue = require('../queue/RedisQueue');

/**
 * @param {string} suiteName Suite name
 * @param {boolean} useRedis Use redis queue
 * @param {import('../report/suite').SuiteReportViewOptions} options View options
 * @returns {object}
 */
function run(suiteName, useRedis = false, options) {
  const log = new Logger();

  let suiteRunner;
  let queue;

  if (useRedis) {
    log.info('Run with redis');
    queue = new RedisQueue(config.checksQueueName);
    suiteRunner = new SuiteRunner(queue);
  } else {
    suiteRunner = new SuiteRunner();
  }

  log.info(`Running suite ${JSON.stringify(suiteName)}`);

  return suiteRunner
    .run(suiteName)
    .then((result) => {
      const prepared = processReport(result, options);

      if (!result.success) {
        log.error('Suite failed\n', stringifyReport(prepared));
        process.exit(1);
      }

      log.info('Suite success\n', stringifyReport(prepared));
    })
    .catch((err) => {
      log.error('Suite failed\n', stringifyReport(err));
      process.exit(1);
    })
    .finally(() => {
      if (queue) {
        queue.close();
      }
    });
}

module.exports = { run };
