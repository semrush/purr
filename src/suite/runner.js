const uuidv4 = require('uuid/v4');

const config = require('../config');
const utils = require('../utils');
const { SuiteReport } = require('./report');
const { SuiteParser } = require('./parser');
const SimpleQueue = require('../queue/SimpleQueue');
const CheckRunner = require('../check/runner');

class SuiteRunner {
  constructor(queue = new SimpleQueue()) {
    this.suiteParser = new SuiteParser(config.suitesFilePath);
    this.checkRunner = new CheckRunner(queue);
  }

  async run(name = utils.mandatory('name'), suiteId = uuidv4()) {
    const suiteCopy = this.suiteParser.getSuite(name).slice();
    const suiteReport = new SuiteReport(name, suiteId);

    let result = Promise.resolve().then(() => {
      suiteReport.startDateTime = new Date().toISOString();
      suiteReport.success = true;
    });

    while (suiteCopy.length > 0) {
      const check = suiteCopy.shift();

      const checkPromise = Promise.resolve().then(async () => {
        const errorText = 'At least one check failed';

        await this.checkRunner
          .run(check)
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
