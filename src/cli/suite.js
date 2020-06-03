const util = require('util');

const config = require('../config');
const Logger = require('../Logger');
const SuiteRunner = require('../suite/runner');
const RedisQueue = require('../queue/RedisQueue');

function run(suiteName, useRedis = false) {
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
      if (!result.success) {
        log.error(
          'Suite failed\n',
          util.inspect(result, {
            colors: true,
            depth: null,
            maxArrayLength: null,
          })
        );
        process.exit(1);
      }

      log.info(
        'Suite success\n',
        util.inspect(result, {
          colors: true,
          depth: null,
          maxArrayLength: null,
        })
      );
    })
    .catch((err) => {
      log.error(
        'Suite failed\n',
        util.inspect(err, { colors: true, depth: null, maxArrayLength: null })
      );
      process.exit(1);
    })
    .finally(() => {
      if (queue) {
        queue.close();
      }
    });
}

module.exports = { run };
