const util = require('util');

const Logger = require('../Logger');
const SimpleQueue = require('../queue/SimpleQueue');
const CheckRunner = require('../check/runner');

function run(checkName) {
  const log = new Logger();
  const checkRunner = new CheckRunner(new SimpleQueue());

  log.info(`Running check ${JSON.stringify(checkName)}`);

  return checkRunner
    .run(checkName)
    .then((result) => {
      if (!result.success) {
        log.error(
          'Check failed\n',
          util.inspect(result, {
            colors: true,
            depth: null,
            maxArrayLength: null,
          })
        );
        process.exit(1);
      }

      log.info(
        'Check success\n',
        util.inspect(result, {
          colors: true,
          depth: null,
          maxArrayLength: null,
        })
      );
    })
    .catch((err) => {
      log.error(
        'Check failed\n',
        util.inspect(err, { colors: true, depth: null, maxArrayLength: null })
      );
      process.exit(1);
    });
}

module.exports = { run };
