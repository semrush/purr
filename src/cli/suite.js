const log = require('../logger');
const config = require('../config');
const SuiteRunner = require('../suite/runner');
const { processReport } = require('../report/suite');
const RedisQueue = require('../queue/RedisQueue');

/**
 * @param {string} name Suite name
 * @param {boolean} useRedis Use redis queue
 * @param {import('../report/suite').SuiteReportViewOptions} options View options
 * @returns {object}
 */
function run(name, useRedis = false, options) {
  let suiteRunner;
  let queue;

  if (useRedis) {
    log.info('Run with redis');
    queue = new RedisQueue(config.checksQueueName);
    suiteRunner = new SuiteRunner(queue);
  } else {
    suiteRunner = new SuiteRunner();
  }

  log.info('Running suite', { name });

  return suiteRunner
    .run(name)
    .then((result) => {
      const prepared = processReport(result, options);

      if (!result.success) {
        log.error('Suite failed', { report: prepared });
        process.exit(1);
      }

      log.info('Suite success', { report: prepared });
    })
    .catch((err) => {
      log.error('Suite failed', { report: err });
      process.exit(1);
    })
    .finally(() => {
      if (queue) {
        queue.close();
      }
    });
}

module.exports = { run };
