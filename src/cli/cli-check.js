#!/usr/bin/env node
const commander = require('commander');
const util = require('util');

const utils = require('../utils');

utils.logUnhandledRejections(true);

commander.arguments('<name>').parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.help();
}

const Logger = require('../Logger');
const SimpleQueue = require('../queue/SimpleQueue');
const CheckRunner = require('../check/runner');

const log = new Logger();
const checkRunner = new CheckRunner(new SimpleQueue());

log.info(`Running check ${JSON.stringify(commander.args[0])}`);

checkRunner
  .run(commander.args[0])
  .then((result) => {
    log.info(
      'Check success\n',
      util.inspect(result, { colors: true, depth: null, maxArrayLength: null })
    );
  })
  .catch((err) => {
    log.error(
      'Check failed\n',
      util.inspect(err, { colors: true, depth: null, maxArrayLength: null })
    );
    process.exit(1);
  });
