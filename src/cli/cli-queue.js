#!/usr/bin/env node
const commander = require('commander');

const config = require('../config');
const utils = require('../utils');
const Logger = require('../Logger');
const RedisQueue = require('../queue/RedisQueue');

utils.logUnhandledRejections(true);

const log = new Logger();

commander
  .command('clean <period>')
  .description('Remove queue jobs older than N(time modifiers: s, m, h, d, w)')
  .action(async (timeAsString) => {
    const ms = utils.humanReadableTimeToMS(timeAsString);

    const queue = new RedisQueue(config.checksQueueName);

    const removedJobs = {
      completed: (await queue.bull.clean(ms, 'completed')).length || 0,
      failed: (await queue.bull.clean(ms, 'failed')).length || 0,
    };

    log.info('Queue jobs removed:', removedJobs);

    queue.close();
  });

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.help();
}
