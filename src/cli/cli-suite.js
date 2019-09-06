#!/usr/bin/env node
const commander = require('commander');

const utils = require('../utils');

utils.logUnhandledRejections(true);

commander
  .arguments('<name>')
  .option('--redis', 'use redis queue')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.help();
}

const config = require('../config');
const Logger = require('../Logger');
const SuiteRunner = require('../suite/runner');
const RedisQueue = require('../queue/RedisQueue');

const log = new Logger();

let suiteRunner;
let queue;

if (commander.redis) {
  log.info('Run with redis');
  queue = new RedisQueue(config.checksQueueName);
  suiteRunner = new SuiteRunner(queue);
} else {
  suiteRunner = new SuiteRunner();
}

log.info(`Running suite ${JSON.stringify(commander.args[0])}`);

suiteRunner
  .run(commander.args[0])
  .then((result) => {
    if (!result.success) {
      log.error('Suite failed\n', result);
      process.exit(1);
    }
    log.info('Suite success\n', result);
  })
  .catch((err) => {
    log.error('Suite failed\n', err);
    process.exit(1);
  })
  .finally(() => {
    if (queue) {
      queue.close();
    }
  });
