#!/usr/bin/env node
const commander = require('commander');

const utils = require('../utils');
const check = require('./check');
const Logger = require('../Logger');

utils.logUnhandledRejections(true);

const log = new Logger();

let checkName;

commander
  .arguments('<name>')
  .action((name) => {
    checkName = name;
  })
  .parse(process.argv);

if (checkName === undefined) {
  log.error('Check name not specified!');
  commander.outputHelp();
  process.exit(1);
}

// Workaround for tests coverage
check.run(checkName);
