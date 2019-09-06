#!/usr/bin/env node
const commander = require('commander');

const Logger = require('../Logger');
const Server = require('../api/Server');

const log = new Logger();

let actionArg;

commander
  .arguments('<action>')
  .action((action) => {
    actionArg = action;
  })
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.help();
}

if (actionArg !== 'start') {
  log.error(`Action '${actionArg}' does not exists`);
  process.exit(1);
} else {
  log.info(`Running api server`);

  Server.start();
}
