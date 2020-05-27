#!/usr/bin/env node
const commander = require('commander');
const Sentry = require('@sentry/node');
const Redis = require('ioredis');

const config = require('../config');
const utils = require('../utils');
const Logger = require('../Logger');
const RedisQueue = require('../queue/RedisQueue');
const RedisQueueWorker = require('../queue/RedisQueueWorker');
const CheckRunner = require('../check/runner');

const log = new Logger();

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

  const checkInfoString = JSON.stringify({
    name: job.data.name,
    schedule: job.data.scheduleName,
    id: job.id,
  });

  log.info(`Check running.`, checkInfoString);

  function saveReport(report) {
    if (job.data.scheduleInterval > 0) {
      const redis = new Redis({
        port: config.redisPort,
        host: config.redisHost,
        password: config.redisPassword,
      });

      redis
        .set(
          `purr:reports:checks:${report.scheduleName}:${report.name}`,
          JSON.stringify(report),
          'ex',
          (job.data.scheduleInterval / 1000) * 2
        )
        .catch((err) => {
          log.error('Can not write report to redis:', err);
        })
        .finally(() => {
          redis.quit();
        });
    }
  }

  return new CheckRunner(checksQueue)
    .doCheck(
      job.data.name,
      job.id,
      job.data.params,
      job.data.scheduleName,
      job.data.labels,
      job.data.proxy,
      job.data.cookieWhitelist
    )
    .then((result) => {
      log.info(`Check complete.`, checkInfoString);

      saveReport(result);

      done(null, result);
    })
    .catch((result) => {
      log.info(`Check failed.`, checkInfoString);

      if (result instanceof Error) {
        done(result);
        return;
      }

      saveReport(result);

      done(null, result);
    })
    .finally(() => {
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

    log.info(`Running worker on queue '${queueName}'`);

    return queueWorker.start().catch((err) => {
      Sentry.captureException(err);
      log.error(`Worker start failed: ${err}`);
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
  log.error(`Worker with name '${commander.args[0]}' does not exist`);
  process.exit(1);
});

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
  commander.help();
}
