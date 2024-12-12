const { program } = require('commander');
const config = require('../config');
const utils = require('../utils');
const check = require('./check');
const log = require("../logger");

config.artifactsGroupByCheckName = true;
process.env.PRETTY_LOG = 'true';
utils.logUnhandledRejections(true);

let checkName;

program
  .arguments('<name>')
  .option('--no-shorten', 'disable successful reports shortening')
  .option('--hide-actions', 'hide actions from reports (default: false)')
  .action((name) => {
    checkName = name;
  })
  .parse(process.argv);

const { shorten } = program.opts();
let { hideActions } = program.opts();
hideActions = hideActions !== undefined;

log.info('Request blocking is enabled for the following URLs:', {
  urls: config.blockedResourceDomains,
});

// Workaround for tests coverage
check.run(checkName, { shorten, hideActions });
