const Bull = require('bull');

const config = require('../config');
const utils = require('../utils');
const BaseQueue = require('./BaseQueue');

class RedisQueue extends BaseQueue {
  constructor(name = utils.mandatory('name')) {
    super();
    this.name = name;
    this.bull = new Bull(this.name, {
      redis: {
        port: config.redisPort,
        host: config.redisHost,
        password: config.redisPassword,
      },
    });
  }

  async close() {
    return this.bull.close();
  }

  async add(
    name = utils.mandatory('name'),
    checkId = utils.mandatory('checkId'),
    params = {},
    repeat = {},
    scheduleName = null,
    scheduleInterval = 0,
    waitJobFinish = true,
    labels = [],
    proxy = null,
    allowedCookies = []
  ) {
    if (typeof name !== 'string') {
      throw new Error(`Task name should be 'string', now: '${typeof task}'`);
    }
    if (typeof params !== 'object') {
      throw new Error(
        `Task params should be 'object', now: '${typeof params}'`
      );
    }

    const jobOptions = {
      jobId: checkId,
      timeout: config.redisJobTTL,
      removeOnComplete: true,
      removeOnFail: true,
    };

    if (Object.keys(repeat).length > 0) {
      jobOptions.repeat = repeat;
    }

    const jobPromise = this.bull.add(
      name,
      {
        name,
        checkId,
        params: {
          ...utils.getPrefixedEnvVars(config.envVarParamPrefix),
          ...params,
        },
        scheduleName,
        scheduleInterval,
        labels,
        proxy,
        allowedCookies,
      },
      jobOptions
    );

    if (waitJobFinish !== true) {
      return jobPromise;
    }

    return jobPromise.then(async (job) => {
      const finished = await job.finished();
      return finished;
    });
  }

  async getJobCounts() {
    return this.bull.getJobCounts();
  }

  async getRepeatableJobs() {
    return this.bull.getRepeatableJobs();
  }

  async removeRepeatableByKey(key = utils.mandatory('key')) {
    return this.bull.removeRepeatableByKey(key);
  }
}

module.exports = RedisQueue;
