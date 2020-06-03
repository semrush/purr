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
  .action((name) => {
    suiteName = name;
  })
  .parse(process.argv);

const useRedis = !!commander.redis;

if (suiteName === undefined) {
  log.error('Suite name not specified!');
  commander.outputHelp();
  process.exit(1);
}

// Workaround for tests coverage
suite.run(suiteName, useRedis);
