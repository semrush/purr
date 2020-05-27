const prom = require('prom-client');
const Redis = require('ioredis');

const Logger = require('../../Logger');
const config = require('../../config');
const RedisQueue = require('../../queue/RedisQueue');

const log = new Logger();
const metricPrefix = 'purr_';

prom.collectDefaultMetrics({ timeout: 5000, prefix: metricPrefix });

const queueJobCountGauge = new prom.Gauge({
  name: `${metricPrefix}queue_job_count`,
  help: 'Count of jobs in queue',
  labelNames: ['queue', 'state'],
});

const labelNames = ['name', 'schedule', 'team', 'product', 'priority'];
const reportCheckSuccessGauge = new prom.Gauge({
  name: `${metricPrefix}report_check_success`,
  help: 'Status of last check execution',
  labelNames,
});

const reportCheckForbiddenCookiesCounter = new prom.Counter({
  name: `${metricPrefix}report_check_forbidden_cookies_count`,
  help: 'Count of forbidden cookies found',
  labelNames,
});

const reportCheckStartGauge = new prom.Gauge({
  name: `${metricPrefix}report_check_start_date`,
  help: 'Start time',
  labelNames,
});

const reportCheckEndGauge = new prom.Gauge({
  name: `${metricPrefix}report_check_end_date`,
  help: 'End time',
  labelNames,
});

const reportCheckLastStepGauge = new prom.Gauge({
  name: `${metricPrefix}report_check_last_step`,
  help: 'Number of last executed step(from 0)',
  labelNames,
});

class Metrics {
  static async get(req, res) {
    // Queues status
    const redisQueues = [new RedisQueue(config.checksQueueName)];

    redisQueues.forEach(async (queue) => {
      Object.entries(await queue.getJobCounts()).forEach(([k, v]) => {
        queueJobCountGauge.set({ queue: queue.name, state: k }, v);
      });

      queue.close();
    });

    // Reports
    const redis = new Redis({
      port: config.redisPort,
      host: config.redisHost,
      password: config.redisPassword,
    });

    const schedules = {};

    await redis
      .keys('purr:schedules:*')
      .then((keys) => {
        return Promise.all(
          keys.map(async (key) => {
            return redis
              .get(key)
              .then((result) => {
                schedules[key.replace('purr:schedules:', '')] = JSON.parse(
                  result
                );
              })
              .catch((err) => {
                log.error('Can not get schedule from redis:', err);
              });
          })
        );
      })
      .catch((err) => {
        log.error('Can not get schedule list from redis:', err);
      });

    await Promise.all(
      Object.entries(schedules).map(async ([scheduleName, checks]) => {
        return Promise.all(
          checks.map((checkName) => {
            const key = `purr:reports:checks:${scheduleName}:${checkName}`;

            return redis
              .get(key)
              .then((result) => {
                const report = JSON.parse(result);
                if (
                  !report ||
                  !Object.prototype.hasOwnProperty.call(report, 'success')
                ) {
                  log.warn(
                    `Can not fill report metrics(report key: ${key}) ` +
                      `because the report is in wrong format. Report:`,
                    report
                  );
                }

                const team = report.labels.team
                  ? report.labels.team
                  : config.defaultTeamLabel;

                const product = report.labels.product
                  ? report.labels.product
                  : config.defaultProductLabel;

                const priority = report.labels.priority
                  ? report.labels.priority
                  : config.defaultPriorityLabel;

                const labels = {
                  name: checkName,
                  schedule: scheduleName,
                  team,
                  product,
                  priority,
                };

                try {
                  reportCheckSuccessGauge.set(
                    labels,
                    report && report.success ? 1 : 0
                  );

                  reportCheckForbiddenCookiesCounter.inc(
                    labels,
                    report ? report.forbiddenCookiesCount : 0
                  );

                  reportCheckStartGauge.set(
                    labels,
                    report ? Date.parse(report.startDateTime) : 0
                  );
                  reportCheckEndGauge.set(
                    labels,
                    report ? Date.parse(report.endDateTime) : 0
                  );
                  reportCheckLastStepGauge.set(
                    labels,
                    report ? report.actions.length : 0
                  );
                } catch (err) {
                  log.error(
                    `Can not fill report metrics(report key: ${key}):`,
                    err
                  );
                }
              })
              .catch((err) => {
                log.error('Can not get report from redis:', err);
              });
          })
        );
      })
    );

    redis.quit();

    // Other
    res.set('Content-Type', prom.register.contentType);
    res.end(prom.register.metrics());

    prom.register.resetMetrics();
  }
}

module.exports = Metrics;
