const config = require('../config');
const utils = require('../utils');
const BaseQueue = require('./BaseQueue');
const CheckRunner = require('../check/runner');

class SimpleQueue extends BaseQueue {
  constructor() {
    super();
    this.jobsRunning = 0;
  }

  async waitForQueue() {
    while (this.jobsRunning >= config.concurrency) {
      // eslint-disable-next-line no-await-in-loop
      await utils.sleep(1000);
    }
    this.jobsRunning += 1;
  }

  freeQueue() {
    this.jobsRunning -= 1;
  }

  async close() {
    return this;
  }

  async add(
    name = utils.mandatory('name'),
    checkId = utils.mandatory('checkId'),
    params = {},
    repeat = {},
    scheduleName = '',
    scheduleInterval = 0,
    waitJobFinish = true,
    labels = [],
    proxy = null
  ) {
    if (typeof name !== 'string') {
      throw new Error(`Task name should be 'string', now: '${typeof task}'`);
    }
    if (typeof params !== 'object') {
      throw new Error(
        `Task params should be 'object', now: '${typeof params}'`
      );
    }

    return this.waitForQueue()
      .then(async () => {
        return new CheckRunner(this)
          .doCheck(name, checkId, params, scheduleName, labels, proxy)
          .then((result) => result)
          .catch((result) => result);
      })
      .then((taskResult) => {
        return taskResult;
      })
      .finally(() => {
        this.freeQueue();
      });
  }
}

module.exports = SimpleQueue;
