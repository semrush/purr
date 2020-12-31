const commander = require('commander');
const Sentry = require('@sentry/node');
const Redis = require('ioredis');

const log = require('../logger');
const config = require('../config');
const utils = require('../utils');
const metrics = require('../metrics/metrics');
const RedisQueue = require('../queue/RedisQueue');
const RedisQueueWorker = require('../queue/RedisQueueWorker');
const CheckRunner = require('../check/runner');

Sentry.init({
  dsn: config.sentryDSN,
  environment: config.sentryEnvironment,
  release: config.sentryRelease,
  debug: config.sentryDebug,
  attachStacktrace: config.sentryAttachStacktrace,
});
utils.logUnhandledRejections();

function checkProcessor(job, done) {
  const checksQueue = new RedisQueue(config.checksQueueName);

  const checkInfo = {
    name: job.data.name,
    schedule: job.data.scheduleName,
    id: job.id,
  };

  log.info('Check running', checkInfo);

  /**
   *
   * @param {InstanceType<import('../report/check')['CheckReport']>} report Report instance
   */
  async function saveReport(report) {
    if (job.data.scheduleInterval > 0) {
      const redis = new Redis({
        port: config.redisPort,
        host: config.redisHost,
        password: config.redisPassword,
      });

      const checkIdentifier = `${report.scheduleName}:${report.name}`;

      const oldReport = JSON.parse(
        await redis.get(`purr:reports:checks:${checkIdentifier}`)
      );

      const executionTime =
        (new Date(report.endDateTime).getTime() -
          new Date(report.startDateTime).getTime()) /
        1000;

      let waitTime = 0;
      if (oldReport !== null) {
        waitTime =
          (new Date(report.startDateTime).getTime() -
            new Date(oldReport.endDateTime).getTime()) /
          1000;
      }

      let checksStatusCount = metrics.names.checksSuccessfulTotal;
      if (!report.success) {
        checksStatusCount = metrics.names.checksFailedTotal;
      }

      redis
        .multi()
        .incr(`${metrics.redisKeyPrefix}:${checksStatusCount}`)
        .set(
          `purr:reports:checks:${checkIdentifier}`,
          JSON.stringify(report),
          'ex',
          (job.data.scheduleInterval / 1000) * 2
        )
        .set(
          `${metrics.redisKeyPrefix}:${metrics.names.checkDurationSeconds}:${checkIdentifier}`,
          executionTime
        )
        .set(
          `${metrics.redisKeyPrefix}:${metrics.names.checkWaitTimeSeconds}:${checkIdentifier}`,
          waitTime
        )
        .exec()
        .catch((err) => {
          log.error('Can not write report to redis: ', err);
        })
        .finally(() => {
          redis.quit();
        });
    }
  }

  Sentry.setExtra('job', job);
  Sentry.setTags({
    checkName: job.data.name,
    scheduleName: job.data.scheduleName,
  });

  return new CheckRunner(checksQueue)
    .doCheck(
      job.data.name,
      job.id,
      job.data.params,
      job.data.scheduleName,
      job.data.labels,
      job.data.proxy,
      job.data.allowedCookies
    )
    .then(async (result) => {
      log.info('Check complete', checkInfo);

      await saveReport(result);

      done(null, result);
    })
    .catch(async (result) => {
      log.info('Check failed', checkInfo);

      if (result instanceof Error) {
        done(result);
        return;
      }

      await saveReport(result);

      done(null, result);
    })
    .finally(() => {
      Sentry.setExtra('job', undefined);
      Sentry.setTags({
        checkName: undefined,
        scheduleName: undefined,
      });

      checksQueue.close();
    });
}

function createWorker(queueName, concurrency, queueProcessor) {
  return () => {
    const queueWorker = new RedisQueueWorker(
      queueName,
      concurrency,
      queueProcessor
    );

    process.on('SIGINT', async () => {
      log.info('Caught SIGINT. Trying to perform a graceful shutdown...');
      await queueWorker.stop();
    });
    process.on('SIGTERM', async () => {
      log.info('Caught SIGTERM. Trying to perform a graceful shutdown...');
      await queueWorker.stop();
    });

    log.info('Running queue worker', { queue: queueName });

    return queueWorker.start().catch((err) => {
      Sentry.captureException(err);
      log.error('Worker start failed: ', err);
      process.exit(1);
    });
  };
}

commander
  .command('check')
  .description('Run checks processing worker')
  .action(
    createWorker(config.checksQueueName, config.concurrency, checkProcessor)
  );

commander.command('*', { isDefault: true, noHelp: true }).action(async () => {
  log.error('Worker with specified name does not exist', {
    name: commander.args[0],
  });
  process.exit(1);
});

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.help();
}
