const path = require('path');
const utils = require('./utils');

const envParams = utils.getPrefixedEnvVars('PURR_CONFIG_');

function getDefault(value, defaultValue = utils.mandatory('default')) {
  if (value === undefined || Number.isNaN(value)) {
    return defaultValue;
  }
  return value;
}

const artifactsDir = getDefault(
  envParams.ARTIFACTS_DIR,
  path.resolve(__dirname, '../storage')
);

const config = {
  concurrency: getDefault(parseInt(envParams.CONCURRENCY, 10), 4),

  checksQueueName: getDefault(envParams.CHECKS_QUEUE_NAME, 'checks-queue'),

  checksFilePath: getDefault(
    envParams.CHECKS_FILE_PATH,
    path.resolve(__dirname, '../data/checks.yml')
  ),
  suitesFilePath: getDefault(
    envParams.SUITES_FILE_PATH,
    path.resolve(__dirname, '../data/suites.yml')
  ),
  parametersInfoFilePath: getDefault(
    envParams.PARAMETERS_INFO_FILE_PATH,
    path.resolve(__dirname, '../data/parameters.yml')
  ),
  schedulesFilePath: getDefault(
    envParams.SCHEDULES_FILE_PATH,
    path.resolve(__dirname, '../data/schedules.yml')
  ),

  defaultTeamLabel: 'sre',
  defaultProductLabel: '',
  defaultPriorityLabel: 'p3',

  artifactsDir,
  screenshots: getDefault(envParams.SCREENSHOTS !== 'false', true),
  screenshotsDir: getDefault(
    envParams.SCREENSHOTS_DIR,
    path.resolve(artifactsDir, 'screenshots')
  ),
  traces: getDefault(envParams.TRACES !== 'false', true),
  tracesDir: getDefault(
    envParams.TRACES_DIR,
    path.resolve(artifactsDir, 'traces')
  ),
  consoleLog: getDefault(envParams.CONSOLE_LOG !== 'false', true),
  consoleLogDir: getDefault(
    envParams.CONSOLE_LOG_DIR,
    path.resolve(artifactsDir, 'console_log')
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
