#!/usr/bin/env node
const commander = require('commander');

const utils = require('../utils');
const suite = require('./suite');
const Logger = require('../Logger');

utils.logUnhandledRejections(true);

const log = new Logger();

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
