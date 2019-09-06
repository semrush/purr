const uuidv4 = require('uuid/v4');

const utils = require('../../utils');
const { CheckReport } = require('../report');

class CheckRunner {
  constructor(queue = utils.mandatory('queue')) {
    this.queue = queue;
  }

  async run(name, checkId, scheduleName = '') {
    return this.doCheck(name, checkId, scheduleName);
  }

  async doCheck(
    name = utils.mandatory('name'),
    checkId = uuidv4(),
    scheduleName = '',
    scheduleInterval = 0
  ) {
    const checkReport = new CheckReport(name, checkId);
    checkReport.scheduleName = scheduleName;
    checkReport.scheduleInterval = scheduleInterval;

    let result = Promise.resolve().then(() => {
      checkReport.startDateTime = new Date().toISOString();
    });

    result = result.then(async () => {
      await utils.sleep(100);

      if (name === 'failing-fake-check') {
        checkReport.success = false;
        checkReport.shortMessage = 'Mocked failing check is failed';
        checkReport.fullMessage = 'Mocked failing check is failed';
        return Promise.reject(checkReport);
      }

      if (name === 'check-with-exception') {
        throw new Error('check-with-exception-error');
      }

      checkReport.success = true;
      checkReport.shortMessage = 'Moked check is successful';
      checkReport.fullMessage = 'Moked check is successful';
      return Promise.resolve(checkReport);
    });

    result = result.finally(async () => {
      checkReport.endDateTime = new Date().toISOString();
    });

    return result;
  }
}

module.exports = CheckRunner;
