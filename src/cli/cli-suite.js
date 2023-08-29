const commander = require('commander');

process.env.PRETTY_LOG = 'true';
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

const { redis, shorten, split, part } = commander.opts();
let { hideActions } = commander.opts();
hideActions = hideActions !== undefined;

// Workaround for tests coverage
suite.run(suiteName, !!redis, {
  report: {
    checkOptions: {
      shorten,
      hideActions,
    },
  },
  run: { split, part },
});
