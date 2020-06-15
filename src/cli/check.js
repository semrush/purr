const Logger = require('../Logger');
const SimpleQueue = require('../queue/SimpleQueue');
const CheckRunner = require('../check/runner');
const { processReport, stringifyReport } = require('../report/check');

/**
 * @param {string} checkName Check name
 * @param {(import('../report/check').CheckReportViewOptions)} options View options
 * @returns {object}
 */
function run(checkName, options) {
  const log = new Logger();
  const checkRunner = new CheckRunner(new SimpleQueue());

  log.info(`Running check ${JSON.stringify(checkName)}`);

  return checkRunner
    .run(checkName)
    .then((result) => {
      const prepared = processReport(result, options);

      if (!result.success) {
        log.error('Check failed\n', stringifyReport(result));
        process.exit(1);
      }

      log.info('Check success\n', stringifyReport(prepared));
    })
    .catch((err) => {
      log.error('Check failed\n', stringifyReport(err));
      process.exit(1);
    });
}

module.exports = { run };
