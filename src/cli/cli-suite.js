const commander = require('commander');

process.env.PRETTY_LOG = 'true';
const log = require('../logger');
const utils = require('../utils');
const suite = require('./suite');

utils.logUnhandledRejections(true);

let suiteName;

commander
  .arguments('<name>')
  .option('--redis', 'use redis queue')
  .option('--no-shorten', 'disable successful reports shortening')
  .option('--hide-actions', 'hide actions from reports (default: false)')
  .action((name) => {
    suiteName = name;
  })
  .parse(process.argv);

const useRedis = !!commander.redis;
const { shorten } = commander;
const hideActions =
  commander.hideActions === undefined ? false : commander.hideActions;

if (suiteName === undefined) {
  log.error('Suite name not specified!');
  commander.outputHelp();
  process.exit(1);
}

// Workaround for tests coverage
suite.run(suiteName, useRedis, {
  reportOptions: { shorten, hideActions },
});
