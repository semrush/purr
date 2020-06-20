const Bull = require('bull');
const Sentry = require('@sentry/node');

const log = require('../logger');
const config = require('../config');
const utils = require('../utils');

class RedisQueueWorker {
  constructor(
    queueName = utils.mandatory('queueName'),
    concurrency = utils.mandatory('concurrency'),
    processor = utils.mandatory('processor')
  ) {
    this.queueName = queueName;
    this.concurrency = concurrency;
    this.processor = processor;

    this.bull = new Bull(this.queueName, {
      redis: {
        port: config.redisPort,
        host: config.redisHost,
        password: config.redisPassword,
        showFriendlyErrorStack: true,
      },
    });
  }

  async start() {
    try {
      await this.bull
        .on('error', (err) => {
          Sentry.captureException(err);
          log.error('Bull: error: ', err);
        })
        .on('stalled', (job) => {
          const err = new Error('Bull: job is stalled');

          Sentry.withScope((scope) => {
            scope.setLevel('warning').setExtra('job', job);
            Sentry.captureException(err);
          });

          log.warn(err);
        })
        .on('failed', (job, err) => {
          Sentry.withScope((scope) => {
            scope.setLevel('warning').setExtra('job', job);
            Sentry.captureException(err);
          });

          log.error('Bull: job failed: ', err);
        })
        .process('*', this.concurrency, this.processor);
    } catch (err) {
      throw utils.enrichError(err, `Bull: can not register processor`);
    }
  }

  async stop() {
    return this.bull.close();
  }
}

module.exports = RedisQueueWorker;
