const commander = require('commander');

const log = require('../logger');
const Server = require('../api/Server');

let action;

commander
  .arguments('<action>')
  .action((actionArg) => {
    action = actionArg;
  })
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.help();
}

if (action !== 'start') {
  log.error('Action does not exists', { action });
  process.exit(1);
} else {
  log.info('Running api server');

  Server.start();
}
