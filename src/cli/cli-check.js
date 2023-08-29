const commander = require('commander');

process.env.PRETTY_LOG = 'true';
const config = require('../config');
const utils = require('../utils');
const check = require('./check');

config.artifactsGroupByCheckName = true;

utils.logUnhandledRejections(true);

let checkName;

commander
  .arguments('<name>')
  .option('--no-shorten', 'disable successful reports shortening')
  .option('--hide-actions', 'hide actions from reports (default: false)')
  .action((name) => {
    checkName = name;
  })
  .parse(process.argv);

const { shorten } = commander.opts();
let { hideActions } = commander.opts();
hideActions = hideActions !== undefined;

// Workaround for tests coverage
check.run(checkName, { shorten, hideActions });
