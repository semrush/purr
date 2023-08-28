const path = require('path');
const isUndefined = require('lodash.isundefined');
const utils = require('../utils');

/**
 * Returns defaultValue if value is undefined or NaN
 * @param {any} value
 * @param {any} defaultValue
 */
function getDefault(value, defaultValue = utils.mandatory('default')) {
  if (value === undefined || Number.isNaN(value)) {
    return defaultValue;
  }
  return value;
}

class Configuration {
  constructor(envParams, rootDir) {
    const dataDir = getDefault(
      envParams.DATA_DIR,
      path.resolve(rootDir, '../data')
    );

    const reportsDirName = 'reports';
    const screenshotsDirName = 'screenshots';
    const tracesDirName = 'traces';
    const harsDirName = 'hars';
    const consoleLogDirName = 'console_log';

    this.concurrency = getDefault(parseInt(envParams.CONCURRENCY, 10), 4);
    this.checksQueueName = getDefault(
      envParams.CHECKS_QUEUE_NAME,
      'checks-queue'
    );
    this.checksDir = path.resolve(dataDir, 'checks');
    this.suitesDir = path.resolve(dataDir, 'suites');

    this.parametersInfoFilePath = getDefault(
      envParams.PARAMETERS_INFO_FILE_PATH,
      path.resolve(dataDir, 'parameters.yml')
    );

    this.schedulesFilePath = getDefault(
      envParams.SCHEDULES_FILE_PATH,
      path.resolve(dataDir, 'schedules.yml')
    );

    this.defaultTeamLabel = 'sre';
    this.defaultProductLabel = '';
    this.defaultPriorityLabel = 'p3';
    this.defaultAppNameLabel = '';
    this.defaultAppLinkLabel = '';
    this.defaultSlackChannelLabel = '';

    this.artifactsKeepSuccessful = getDefault(
      envParams.ARTIFACTS_KEEP_SUCCESSFUL !== 'false',
      true
    );

    this.artifactsGroupByCheckName = false;
    this.artifactsDir = getDefault(
      envParams.ARTIFACTS_DIR,
      path.resolve(rootDir, '../storage')
    );
    this.artifactsTempDir = getDefault(
      envParams.ARTIFACTS_TEMP_DIR,
      path.resolve(rootDir, '../storage_tmp')
    );

    this.reports = getDefault(envParams.REPORTS !== 'false', true);
    this.latestFailedReports = getDefault(
      envParams.LATEST_FAILED_REPORTS !== 'false',
      true
    );
    this.reportsDir = getDefault(
      envParams.REPORTS_DIR,
      path.resolve(this.artifactsDir, reportsDirName)
    );

    this.screenshots = getDefault(envParams.SCREENSHOTS !== 'false', true);
    this.screenshotsDir = getDefault(
      envParams.SCREENSHOTS_DIR,
      path.resolve(this.artifactsDir, screenshotsDirName)
    );

    this.traces = getDefault(envParams.TRACES !== 'false', true);
    this.tracesDir = getDefault(
      envParams.TRACES_DIR,
      path.resolve(this.artifactsDir, tracesDirName)
    );
    this.tracesTempDir = path.resolve(this.artifactsTempDir, tracesDirName);

    this.hars = getDefault(envParams.HARS === 'true', false);
    this.harsDir = getDefault(
      envParams.HARS_DIR,
      path.resolve(this.artifactsDir, harsDirName)
    );

    this.harsTempDir = path.resolve(this.artifactsTempDir, harsDirName);

    this.consoleLog = getDefault(envParams.CONSOLE_LOG !== 'false', true);
    this.consoleLogDir = getDefault(
      envParams.CONSOLE_LOG_DIR,
      path.resolve(this.artifactsDir, consoleLogDirName)
    );

    this.envVarParamPrefix = getDefault(
      envParams.ENV_VAR_PARAM_PREFIX,
      'PURR_PARAM_'
    );

    this.windowWidth = getDefault(parseInt(envParams.WINDOW_WIDTH, 10), 1920);
    this.windowHeight = getDefault(parseInt(envParams.WINDOW_HEIGHT, 10), 1080);
    this.navigationTimeout = getDefault(
      parseInt(envParams.NAVIGATION_TIMEOUT, 10),
      30000
    );
    this.userAgent = getDefault(envParams.USER_AGENT, 'uptime-agent');

    this.redisHost = getDefault(envParams.REDIS_HOST, 'redis');
    this.redisPort = getDefault(parseInt(envParams.REDIS_PORT, 10), 6379);
    this.redisPassword = getDefault(envParams.REDIS_PASSWORD, '');
    // TODO: test this
    this.redisJobTTL = getDefault(parseInt(envParams.REDIS_JOB_TTL, 10), 60000);

    this.apiUrlPrefix = '/api/v1';
    this.apiWaitTimeout = getDefault(
      parseInt(envParams.API_WAIT_TIMEOUT, 10),
      27000
    );

    this.logLevel = getDefault(envParams.LOG_LEVEL, 'info');

    this.sentryDSN = getDefault(envParams.SENTRY_DSN, '');
    this.sentryEnvironment = getDefault(
      envParams.SENTRY_ENVIRONMENT,
      'production'
    );
    this.sentryRelease = getDefault(envParams.SENTRY_RELEASE, '');
    this.sentryDebug = getDefault(envParams.SENTRY_DEBUG === 'true', false);
    this.sentryAttachStacktrace = getDefault(
      envParams.SENTRY_ATTACH_STACKTRACE === 'true',
      false
    );

    this.blockedResourceDomains = getDefault(
      envParams.BLOCKED_RESOURCE_DOMAINS,
      ''
    )
      .split(',')
      .map((domain) => domain.toLowerCase().trim())
      .filter((domain) => domain.length > 0);

    /**
     * Additional arguments to pass to the browser instance
     * @type String[]
     */
    this.chromiumLaunchArgs = getDefault(envParams.CHROMIUM_LAUNCH_ARGS, '')
      .split(',')
      .map((arg) => arg.trim())
      .filter((arg) => arg.length > 0);

    this.chromiumRemoteDebugging = getDefault(
      envParams.CHROMIUM_REMOTE_DEBUGGING === 'true',
      false
    );

    this.chromiumRemoteDebuggingAddress = getDefault(
      envParams.CHROMIUM_REMOTE_DEBUGGING_ADDRESS,
      '127.0.0.1'
    );

    this.chromiumRemoteDebuggingPort = getDefault(
      parseInt(envParams.CHROMIUM_REMOTE_DEBUGGING_PORT, 10),
      9222
    );

    this.cookieTracking = getDefault(
      envParams.COOKIE_TRACKING === 'true',
      false
    );

    this.cookieTrackingHideValue = getDefault(
      envParams.COOKIE_TRACKING_HIDE_VALUE !== 'false',
      true
    );

    this.browserHeadless = getDefault(
      envParams.BROWSER_HEADLESS !== 'false',
      true
    );

    this.browserDumpIO = getDefault(
      envParams.BROWSER_DUMP_IO === 'true',
      false
    );

    if (this.artifactsGroupByCheckName && isUndefined(this.artifactsDir)) {
      throw new Error(
        'Enabled group artifacts by check name and artifacts path not specified'
      );
    }

    if (!this.artifactsGroupByCheckName && isUndefined(this.tracesDir)) {
      throw new Error('Traces enabled but storage path not specified');
    }

    if (!this.artifactsGroupByCheckName && isUndefined(this.harsDir)) {
      throw new Error('HARs enabled but storage path not specified');
    }

    if (!this.artifactsGroupByCheckName && isUndefined(this.screenshotsDir)) {
      throw new Error('Screenshots enabled but storage path not specified');
    }

    if (!this.artifactsGroupByCheckName && isUndefined(this.consoleLogDir)) {
      throw new Error('Console logging enabled but storage path not specified');
    }

    if (!this.artifactsGroupByCheckName && isUndefined(this.reportsDir)) {
      throw new Error('Reports enabled but storage path not specified');
    }
  }
}

module.exports = {
  Configuration,
};
