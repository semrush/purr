const uuidv4 = require('uuid/v4');
const Redis = require('ioredis');

const config = require('../config');
const utils = require('../utils');
const Logger = require('../Logger');
const { ScheduleParser } = require('./parser');
const CheckRunner = require('../check/runner');

const log = new Logger();
const redisParams = {
  port: config.redisPort,
  host: config.redisHost,
  password: config.redisPassword,
};

class ScheduleRunner {
  constructor(queue = utils.mandatory('queue')) {
    this.scheduleParser = new ScheduleParser(config.schedulesFilePath);
    this.checkRunner = new CheckRunner(queue);

    if (typeof queue !== 'object') {
      throw new Error(
        `Queue should be instance of Queue, not '${typeof queue}'`
      );
    }
    this.queue = queue;
  }

  async runAll() {
    const scheduled = [];

    this.scheduleParser.getList().forEach((schedule) => {
      scheduled.push(this.run(schedule));
    });

    return Promise.all(scheduled);
  }

  async run(name = utils.mandatory('name')) {
    const redis = new Redis(redisParams);

    const schedule = this.scheduleParser.getSchedule(name);

    if (typeof schedule.proxy === 'undefined') {
      schedule.proxy = null;
    }

    redis
      .set(`purr:schedules:${name}`, JSON.stringify(schedule.checks))
      .finally(() => {
        redis.quit();
      });

    return Promise.all(
      schedule.checks.map((check) => {
        return this.checkRunner.run(
          check,
          uuidv4(),
          schedule.parameters,
          {
            every: schedule.interval,
          },
          name,
          schedule.interval,
          false,
          schedule.labels,
          schedule.proxy
        );
      })
    );
  }

  getScheduledChecks() {
    return this.queue.getRepeatableJobs();
  }

  async removeScheduledChecks() {
    const checks = await this.getScheduledChecks();
    const redis = new Redis(redisParams);

    await redis
      .keys('purr:schedules:*')
      .then((keys) => {
        return Promise.all(
          keys.map(async (key) => {
            return redis.del(key).catch((err) => {
              log.error('Can not remove schedule from redis:', err);
            });
          })
        );
      })
      .catch((err) => {
        log.error('Can not get schedule list from redis:', err);
      })
      .finally(() => {
        redis.quit();
      });

    return Promise.all(
      checks.map(async (check) => {
        return this.queue.removeRepeatableByKey(check.key);
      })
    );
  }
}

module.exports = ScheduleRunner;
