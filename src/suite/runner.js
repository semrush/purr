const { v4: uuidv4 } = require('uuid');

const config = require('../config');
const utils = require('../utils');
const { SuiteReport } = require('../report/suite');
const { SuiteParser } = require('./parser');
const SimpleQueue = require('../queue/SimpleQueue');
const CheckRunner = require('../check/runner');

/**
 * Suite options.
 * @typedef SuiteRunOptions
 * @property {number} [split] Number of part to split suite
 * @property {number} [part] Part number for execution
 * @property {string} [suiteId]
 */

class SuiteRunner {
  constructor(queue = new SimpleQueue()) {
    this.suiteParser = new SuiteParser(config.suitesDir);
    this.checkRunner = new CheckRunner(queue);
  }

  /**
   *
   * @param {string} name
   * @param {SuiteRunOptions} [options]
   * @returns {Promise<SuiteReport>}
   */
  async run(
    // @ts-ignore
    name = utils.mandatory('name'),
    options = {}
  ) {
    const split = options.split ? options.split : 1;
    const part = options.part ? options.part : 1;
    const suiteId = options.suiteId ? options.suiteId : uuidv4();
    const suiteParts = utils.splitArray(
      this.suiteParser.getSuiteSteps(name).slice(),
      split
    );
    const suiteSteps = suiteParts[part - 1];
    if (!suiteSteps.length) {
      throw Error(`Specified part of suite(${part} of ${split}) is empty`);
    }

    const proxy = this.suiteParser.getSuiteProxy(name);
    const suiteReport = new SuiteReport(name, suiteId);
    suiteReport.runOptions = options;

    let result = Promise.resolve().then(() => {
      suiteReport.startDateTime = new Date().toISOString();
      suiteReport.success = true;
    });

    while (suiteSteps.length > 0) {
      const check = suiteSteps.shift();

      const checkPromise = Promise.resolve().then(async () => {
        const errorText = 'At least one check failed';

        await this.checkRunner
          .run(check, uuidv4(), {}, {}, '', 0, true, [], proxy)
          .then((checkReport) => {
            suiteReport.checks.push(checkReport);

            if (!checkReport.success) {
              suiteReport.success = false;
              suiteReport.shortMessage = errorText;
              suiteReport.fullMessage = errorText;
            }
          })
          .catch((err) => {
            suiteReport.success = false;
            suiteReport.shortMessage = errorText;
            suiteReport.fullMessage = errorText;
            suiteReport.checks.push(err);
          });
      });

      result = result.then(async () => {
        await checkPromise;
      });
    }

    result = result.then(async () => {
      return Promise.resolve(suiteReport);
    });

    result = result.catch(async (err) => {
      suiteReport.success = false;
      suiteReport.shortMessage = err.message;
      // FIXME: circular?
      suiteReport.fullMessage = JSON.stringify(err);
      return Promise.reject(suiteReport);
    });

    result = result.finally(async () => {
      suiteReport.endDateTime = new Date().toISOString();
    });

    return result;
  }
}

module.exports = SuiteRunner;
