const log = require('../logger');
const SimpleQueue = require('../queue/SimpleQueue');
const CheckRunner = require('../check/runner');
const { processReport } = require('../report/check');

/**
 * @param {string} name Check name
 * @param {(import('../report/check').CheckReportViewOptions)} options View options
 * @returns {object}
 */
function run(name, options) {
  const checkRunner = new CheckRunner(new SimpleQueue());

  log.info(`Running check`, { name });

  return checkRunner
    .run(name)
    .then((result) => {
      const prepared = processReport(result, options);

      if (!result.success) {
        log.error('Check failed', { report: result });
        process.exit(1);
      }

      log.info('Check success', { report: prepared });
    })
    .catch((err) => {
      log.error('Check failed', { report: err });
      process.exit(1);
    });
}

module.exports = { run };
