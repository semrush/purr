const commander = require('commander');

const utils = require('../utils');

utils.logUnhandledRejections(true);

const log = require('../logger');
const config = require('../config');
const RedisQueue = require('../queue/RedisQueue');
const ScheduleRunner = require('../schedule/runner');

const queue = new RedisQueue(config.checksQueueName);
const scheduleRunner = new ScheduleRunner(queue);

commander
  .command('show')
  .description('Show scheduled checks')
  .action(() => {
    scheduleRunner
      .getScheduledChecks()
      .then((checks) => {
        log.info('Scheduled checks', { checks });
        process.exit(0);
      })
      .catch((err) => {
        log.error('Can not get scheduled checks: ', err);
        process.exit(1);
      });
  });

commander
  .command('clean')
  .description('Remove scheduled checks')
  .action(() => {
    scheduleRunner
      .removeScheduledChecks()
      .then(() => {
        log.info('Scheduled checks has been removed');
        process.exit(0);
      })
      .catch((err) => {
        log.error('Can not remove scheduled checks: ', err);
        process.exit(1);
      });
  });

commander
  .command('apply')
  .description('Apply schedules')
  .action(async () => {
    await scheduleRunner
      .runAll()
      .then((checks) => {
        log.info('Schedules applied', { count: checks.length });
        process.exit(0);
      })
      .catch((err) => {
        log.error('Can not schedule checks: ', err);
        process.exit(1);
      });
  });

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.help();
}
