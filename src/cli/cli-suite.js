const commander = require('commander');

process.env.PRETTY_LOG = 'true';
const log = require('../logger');
const config = require('../config');
const utils = require('../utils');
const suite = require('./suite');

config.artifactsGroupByCheckName = true;

utils.logUnhandledRejections(true);

let suiteName;

function parseNumberArg(arg) {
  const split = parseInt(arg, 10);
  if (split > 0) {
    return split;
  }
  return 1;
}

commander
  .arguments('<name>')
  .option('--redis', 'use redis queue')
  .option('--no-shorten', 'disable successful reports shortening')
  .option('--hide-actions', 'hide actions from reports (default: false)')
  .option('--split <N>', 'split the scenario into N parts', parseNumberArg, 1)
  .option('--part <N>', 'run checks for part N only', parseNumberArg, 1)
  .action((name) => {
    suiteName = name;
  })
  .parse(process.argv);

const useRedis = !!commander.redis;
const { shorten, split, part } = commander;
const hideActions =
  commander.hideActions === undefined ? false : commander.hideActions;

if (suiteName === undefined) {
  log.error('Suite name not specified!');
  commander.outputHelp();
  process.exit(1);
}

// Workaround for tests coverage
suite.run(suiteName, useRedis, {
  report: { checkOptions: { shorten, hideActions } },
  run: { split, part },
});
