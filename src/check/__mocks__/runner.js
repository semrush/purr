const { v4: uuidv4 } = require('uuid');

const utils = require('../../utils');
const { CheckReport } = require('../../report/check');

class CheckRunner {
  constructor(queue = utils.mandatory('queue')) {
    this.queue = queue;
  }

  async run(name, checkId, scheduleName = null) {
    return this.doCheck(name, checkId, scheduleName);
  }

  async doCheck(
    name = utils.mandatory('name'),
    checkId = uuidv4(),
    scheduleName = null,
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
