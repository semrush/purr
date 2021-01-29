const prom = require('prom-client');
const Redis = require('ioredis');

const log = require('../../logger');
const config = require('../../config');
const RedisQueue = require('../../queue/RedisQueue');
const metrics = require('../../metrics/metrics');

prom.collectDefaultMetrics({ timeout: 5000, prefix: metrics.prefix });

const checksSuccessfulTotal = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.checksSuccessfulTotal}`,
  help: 'Count of successful checks',
});

const checksFailedTotal = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.checksFailedTotal}`,
  help: 'Count of failed checks',
});

const queueJobCountGauge = new prom.Gauge({
  name: `${metrics.prefix}queue_job_count`,
  help: 'Count of jobs in queue',
  labelNames: ['queue', 'state'],
});

const checksScheduled = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.checksScheduled}`,
  help: 'Count of scheduled checks',
});

const labelNames = ['name', 'schedule', 'team', 'product', 'priority'];

const checkIntervalSeconds = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.checkIntervalSeconds}`,
  help: 'Check schedule interval',
  labelNames,
});

const checkWaitTimeSeconds = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.checkWaitTimeSeconds}`,
  help: 'Time from last check completion',
  labelNames,
});

const checkDurationSeconds = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.checkDurationSeconds}`,
  help: 'Last check duration',
  labelNames,
});

const reportCheckSuccess = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.reportCheckSuccess}`,
  help: 'Status of last check execution',
  labelNames,
});

const reportCheckForbiddenCookies = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.reportCheckForbiddenCookies}`,
  help: 'Count of forbidden cookies found',
  labelNames,
});

const reportCheckStart = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.reportCheckStart}`,
  help: 'Start time',
  labelNames,
});

const reportCheckEnd = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.reportCheckEnd}`,
  help: 'End time',
  labelNames,
});

const reportCheckLastStep = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.reportCheckLastStep}`,
  help: 'Number of last executed step(from 0)',
  labelNames,
});

const reportCheckCustomMetric = new prom.Gauge({
  name: `${metrics.prefix}${metrics.names.reportCheckCustomMetric}`,
  help: 'Custom report metrics',
  labelNames: ['name', 'schedule', 'metric_name', 'metric_id'],
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
                const checks = JSON.parse(result);
                schedules[key.replace('purr:schedules:', '')] = checks;
              })
              .catch((err) => {
                log.error('Can not get schedule from redis: ', err);
              });
          })
        );
      })
      .catch((err) => {
        log.error('Can not get schedule list from redis: ', err);
      });

    await Promise.all(
      Object.entries(schedules).map(async ([scheduleName, checks]) => {
        return Promise.all(
          checks.map((checkName) => {
            const checkIdentifier = `${scheduleName}:${checkName}`;
            const reportKey = `purr:reports:checks:${checkIdentifier}`;

            return redis
              .multi()
              .get(reportKey)
              .get(
                [metrics.redisKeyPrefix, metrics.names.checksScheduled].join(
                  ':'
                )
              )
              .get(
                [
                  metrics.redisKeyPrefix,
                  metrics.names.checksSuccessfulTotal,
                ].join(':')
              )
              .get(
                [metrics.redisKeyPrefix, metrics.names.checksFailedTotal].join(
                  ':'
                )
              )
              .get(
                [
                  metrics.redisKeyPrefix,
                  metrics.names.checkDurationSeconds,
                  checkIdentifier,
                ].join(':')
              )
              .get(
                [
                  metrics.redisKeyPrefix,
                  metrics.names.checkWaitTimeSeconds,
                  checkIdentifier,
                ].join(':')
              )
              .get(
                [
                  metrics.redisKeyPrefix,
                  metrics.names.checkIntervalSeconds,
                  scheduleName,
                ].join(':')
              )
              .exec()
              .then((result) => {
                /**
                 * @type {import('../../report/check').CheckReport | null}
                 */
                const report = JSON.parse(result[0][1]);

                if (
                  !report ||
                  !Object.prototype.hasOwnProperty.call(report, 'success')
                ) {
                  log.warn(
                    'Can not fill report metrics because the report is in ' +
                      'wrong format.',
                    { reportKey, report }
                  );
                }

                const team =
                  report && report.labels.team
                    ? report.labels.team
                    : config.defaultTeamLabel;

                const product =
                  report && report.labels.product
                    ? report.labels.product
                    : config.defaultProductLabel;

                const priority =
                  report && report.labels.priority
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
                  const scheduled = JSON.parse(result[1][1]);
                  if (scheduled) {
                    checksScheduled.set(scheduled);
                  }

                  const successful = JSON.parse(result[2][1]);
                  if (successful) {
                    checksSuccessfulTotal.set(successful);
                  }

                  const failed = JSON.parse(result[3][1]);
                  if (failed) {
                    checksFailedTotal.set(failed);
                  }

                  checkDurationSeconds.set(labels, JSON.parse(result[4][1]));
                  checkWaitTimeSeconds.set(labels, JSON.parse(result[5][1]));

                  const interval = JSON.parse(result[6][1]);
                  if (interval) {
                    checkIntervalSeconds.set(labels, interval);
                  }

                  reportCheckSuccess.set(
                    labels,
                    report && report.success ? 1 : 0
                  );

                  reportCheckForbiddenCookies.set(
                    labels,
                    report ? report.forbiddenCookiesCount : 0
                  );

                  reportCheckStart.set(
                    labels,
                    report ? Date.parse(report.startDateTime) : 0
                  );
                  reportCheckEnd.set(
                    labels,
                    report ? Date.parse(report.endDateTime) : 0
                  );
                  reportCheckLastStep.set(
                    labels,
                    report ? report.actions.length : 0
                  );

                  if (report) {
                    report.metrics.forEach((metric) => {
                      reportCheckCustomMetric.set(
                        {
                          name: checkName,
                          schedule: scheduleName,
                          metric_name: metric.labels.name,
                          metric_id: metric.labels.id,
                        },
                        metric.value
                      );
                    });
                  }
                } catch (err) {
                  log.error('Can not fill report metrics: ', err, {
                    reportKey,
                  });
                }
              })
              .catch((err) => {
                log.error('Can not get report from redis: ', err, {
                  reportKey,
                });
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
