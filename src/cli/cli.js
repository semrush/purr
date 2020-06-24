#!/usr/bin/env node
const commander = require('commander');

const log = require('../logger');
const utils = require('../utils');
const config = require('../config');

log.info('Request blocking is enabled for the following URLs:', {
  urls: config.blockedResourceDomains,
});

utils.throwUnhandledRejections();

commander
  .version('0.1.0')
  .command('check <name>', 'Run check')
  .command('suite <name>', 'Run suite')
  .command('worker <name>', 'Run worker')
  .command('server <action>', 'Server controls')
  .command('schedule <name>', 'Schedules controls')
  .command('queue <action>', 'Queue controls')
  .parse(process.argv);
