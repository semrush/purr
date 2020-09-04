const path = require('path');
const utils = require('./utils');

const envParams = utils.getPrefixedEnvVars('PURR_CONFIG_');

/**
 *
 * @param {any} value
 * @param {any} defaultValue
 */
function getDefault(value, defaultValue = utils.mandatory('default')) {
  if (value === undefined || Number.isNaN(value)) {
    return defaultValue;
  }
  return value;
}

const dataDir = getDefault(
  envParams.DATA_DIR,
  path.resolve(__dirname, '../data')
);

const checksDir = path.resolve(dataDir, 'checks');
const suitesDir = path.resolve(dataDir, 'suites');

const artifactsDir = getDefault(
  envParams.ARTIFACTS_DIR,
  path.resolve(__dirname, '../storage')
);

const artifactsTempDir = getDefault(
  envParams.ARTIFACTS_TEMP_DIR,
  path.resolve(__dirname, '../storage_tmp')
);

const reportsDirName = 'reports';
const screenshotsDirName = 'screenshots';
const tracesDirName = 'traces';
const harsDirName = 'hars';
const consoleLogDirName = 'console_log';

const config = {
  concurrency: getDefault(parseInt(envParams.CONCURRENCY, 10), 4),

  checksQueueName: getDefault(envParams.CHECKS_QUEUE_NAME, 'checks-queue'),

  checksDir,
  suitesDir,

  parametersInfoFilePath: getDefault(
    envParams.PARAMETERS_INFO_FILE_PATH,
    path.resolve(dataDir, 'parameters.yml')
  ),
  schedulesFilePath: getDefault(
    envParams.SCHEDULES_FILE_PATH,
    path.resolve(dataDir, 'schedules.yml')
  ),

  defaultTeamLabel: 'sre',
  defaultProductLabel: '',
  defaultPriorityLabel: 'p3',

  artifactsKeepSuccessful: getDefault(
    envParams.ARTIFACTS_KEEP_SUCCESSFUL !== 'false',
    true
  ),
  artifactsGroupByCheckName: false,
  artifactsDir,
  artifactsTempDir,

  reports: getDefault(envParams.REPORTS !== 'false', true),
  reportsDir: getDefault(
    envParams.REPORTS_DIR,
    path.resolve(artifactsDir, reportsDirName)
  ),

  screenshots: getDefault(envParams.SCREENSHOTS !== 'false', true),
  screenshotsDir: getDefault(
    envParams.SCREENSHOTS_DIR,
    path.resolve(artifactsDir, screenshotsDirName)
  ),

  traces: getDefault(envParams.TRACES !== 'false', true),
  tracesDir: getDefault(
    envParams.TRACES_DIR,
    path.resolve(artifactsDir, tracesDirName)
  ),
  tracesTempDir: path.resolve(artifactsTempDir, tracesDirName),

  hars: getDefault(envParams.HARS === 'true', false),
  harsDir: getDefault(
    envParams.HARS_DIR,
    path.resolve(artifactsDir, harsDirName)
  ),
  harsTempDir: path.resolve(artifactsTempDir, harsDirName),

  consoleLog: getDefault(envParams.CONSOLE_LOG !== 'false', true),
  consoleLogDir: getDefault(
    envParams.CONSOLE_LOG_DIR,
    path.resolve(artifactsDir, consoleLogDirName)
  ),

  envVarParamPrefix: getDefault(envParams.ENV_VAR_PARAM_PREFIX, 'PURR_PARAM_'),

  windowWidth: getDefault(parseInt(envParams.WINDOW_WIDTH, 10), 1920),
  windowHeight: getDefault(parseInt(envParams.WINDOW_HEIGHT, 10), 1080),
  navigationTimeout: getDefault(
    parseInt(envParams.NAVIGATION_TIMEOUT, 10),
    30000
  ),
  userAgent: getDefault(envParams.USER_AGENT, 'uptime-agent'),

  redisHost: getDefault(envParams.REDIS_HOST, 'redis'),
  redisPort: getDefault(parseInt(envParams.REDIS_PORT, 10), 6379),
  redisPassword: getDefault(envParams.REDIS_PASSWORD, ''),
  // TODO: test this
  redisJobTTL: getDefault(parseInt(envParams.REDIS_JOB_TTL, 10), 60000),

  apiUrlPrefix: '/api/v1',
  apiWaitTimeout: getDefault(parseInt(envParams.API_WAIT_TIMEOUT, 10), 27000),

  logLevel: getDefault(envParams.LOG_LEVEL, 'info'),

  sentryDSN: getDefault(envParams.SENTRY_DSN, ''),
  sentryEnvironment: getDefault(envParams.SENTRY_ENVIRONMENT, 'production'),
  sentryRelease: getDefault(envParams.SENTRY_RELEASE, ''),
  sentryDebug: getDefault(envParams.SENTRY_DEBUG === 'true', false),
  sentryAttachStacktrace: getDefault(
    envParams.SENTRY_ATTACH_STACKTRACE === 'true',
    false
  ),

  blockedResourceDomains: getDefault(envParams.BLOCKED_RESOURCE_DOMAINS, '')
    .split(',')
    .map((domain) => {
      return domain.toLowerCase().trim();
    })
    .filter((domain) => {
      return domain.length > 0;
    }),

  cookieTracking: getDefault(envParams.COOKIE_TRACKING === 'true', false),

  cookieTrackingHideValue: getDefault(
    envParams.COOKIE_TRACKING_HIDE_VALUE !== 'false',
    true
  ),
};

module.exports = config;
