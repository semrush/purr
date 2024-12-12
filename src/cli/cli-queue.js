const { program } = require('commander');

const log = require('../logger');
const config = require('../config');
const utils = require('../utils');
const RedisQueue = require('../queue/RedisQueue');

utils.logUnhandledRejections(true);

program
  .command('clean <period>')
  .description('Remove queue jobs older than N(time modifiers: s, m, h, d, w)')
  .action(async (timeAsString) => {
    const ms = utils.humanReadableTimeToMS(timeAsString);

    const queue = new RedisQueue(config.checksQueueName);

    const jobs = {
      completed: (await queue.bull.clean(ms, 'completed')).length || 0,
      failed: (await queue.bull.clean(ms, 'failed')).length || 0,
    };

    log.info('Queue jobs removed', { jobs });

    await queue.close();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
