#!/usr/bin/env node
const { program } = require('commander');
const utils = require('../utils');

utils.throwUnhandledRejections();

program
  .version('0.1.0')
  .command('check <name>', 'Run check')
  .command('suite <name>', 'Run suite')
  .command('worker <name>', 'Run worker')
  .command('server <action>', 'Server controls')
  .command('schedule <name>', 'Schedules controls')
  .command('queue <action>', 'Queue controls')
  .parse(process.argv);
