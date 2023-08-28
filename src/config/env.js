/**
 * File contains list of configurable parameters from ENV variables
 * matching `PURR_CONFIG_*` pattern.
 *
 * Please, not that real variable values will be calculated in `../config.js`
 * file and default values given here as example for better understanding
 * of application behaviour.
 */

const DEFAULT_ENV_PARAMS = {
  /**
   * Location of checks, suites, schedules and parameters for tests.
   * @type {string}
   */
  DATA_DIR: '../data',

  /**
   * Location, where to store results of runs
   * @type {string}
   */
  ARTIFACTS_DIR: '../storage',

  /**
   * Location of temporary storage for results
   * @type {string}
   */
  ARTIFACTS_TEMP_DIR: '../storage_tmp',

  /**
   * Amount of concurrent processes when performing checks
   * @type {number}
   */
  CONCURRENCY: 4,

  /**
   * ?
   * @type {string}
   */
  CHECKS_QUEUE_NAME: 'checks-queue',

  /**
   * Name of file with parameters, absolute
   * @type {string}
   * @default "../data/parameters.yml"
   */
  PARAMETERS_INFO_FILE_PATH: 'parameters.yml',

  /**
   * Name of file with scheduled checks
   * @type {string}
   * @default "../data/schedules.yml"
   */
  SCHEDULES_FILE_PATH: 'schedules.yml',

  /**
   * Whether to keep artifacts for successful checks
   * @type {boolean}
   * @default {true}
   */
  ARTIFACTS_KEEP_SUCCESSFUL: true,

  /**
   * Whether to generate test runs reports
   * @type {boolean}
   * @default {true}
   */
  REPORTS: true,

  /**
   * Whether to generate test runs reports for failed checks (save only latest report)
   * @type {boolean}
   * @default {true}
   */
  LATEST_FAILED_REPORTS: true,

  /**
   * Where to store tests reports.
   * @type {string}
   * @default "../storage/reports"
   */
  REPORTS_DIR: '../storage/reports',

  /**
   * Whether to save screenshots for tests runs
   * @type {boolean}
   * @default {true}
   */
  SCREENSHOTS: true,

  /**
   * Where to save screenshots
   * @type {string}
   * @default "../storage/screenshots"
   */
  SCREENSHOTS_DIR: '../storage/screenshots',

  /**
   * Whether to store run traces
   * @type {boolean}
   * @default {true}
   */
  TRACES: true,

  /**
   * Where to store traces
   * @type {string}
   * @default "../storage/traces"
   */
  TRACES_DIR: '../storage/traces',

  /**
   * Whether to store HAR files for checks
   * @type {boolean}
   * @default {false}
   */
  HARS: false,

  /**
   * Where to store HAR files
   * @type {string}
   * @default "../storage/hars"
   */
  HARS_DIR: '../storage/hars',

  /**
   * Whether to store console logs from checks
   * @type {boolean}
   * @default {true}
   */
  CONSOLE_LOG: true,

  /**
   * Where to store console log files
   * @type {string}
   * @default "../storage/console_log"
   */
  CONSOLE_LOG_DIR: '../storage/console_log',

  /**
   * Prefix for PARAMS when configuring them from env variables.
   * @type {string}
   * @default "PURR_PARAM_"
   */
  ENV_VAR_PARAM_PREFIX: 'PURR_PARAM_',

  /**
   * Default width of window for tests
   * @type {number}
   * @default 1920
   */
  WINDOW_WIDTH: 1920,

  /**
   * Default height of window for tests
   * @type {number}
   * @default 1080
   */
  WINDOW_HEIGHT: 1080,

  /**
   * Default timeout for navigation in milliseconds
   * @type {number}
   * @default 30000
   */
  NAVIGATION_TIMEOUT: 30000,

  /**
   * Default user agent for requests from Puppeteer
   * @type {string}
   * @default "uptime-agent"
   */
  USER_AGENT: 'uptime-agent',

  REDIS_HOST: 'redis',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: '',
  REDIS_JOB_TTL: 60000,

  API_WAIT_TIMEOUT: 27000,
  LOG_LEVEL: 'info',
  SENTRY_DSN: '',
  SENTRY_ENVIRONMENT: 'production',
  SENTRY_RELEASE: '',
  SENTRY_DEBUG: false,
  SENTRY_ATTACH_STACKTRACE: false,

  /**
   * List of domains to block in Puppeteer. One should
   * use comma-separated string. For example: `google.com,facebook.com`
   */
  BLOCKED_RESOURCE_DOMAINS: '',

  CHROMIUM_LAUNCH_ARGS: '',
  CHROMIUM_REMOTE_DEBUGGING: false,
  CHROMIUM_REMOTE_DEBUGGING_ADDRESS: '127.0.0.1',
  CHROMIUM_REMOTE_DEBUGGING_PORT: 9222,

  /**
   * Whether to add cookies from checks to action reports.
   * @type {boolean}
   * @default {false}
   */
  COOKIE_TRACKING: false,

  /**
   * Whether to hide cookies values from checks to action reports.
   * Available only if COOKIE_TRACKING is true.
   * @type {boolean}
   * @default {true}
   */
  COOKIE_TRACKING_HIDE_VALUE: true,

  /**
   * Enable/disable headless browser
   *
   * @type {boolean}
   * @default {true}
   */
  BROWSER_HEADLESS: true,

  /**
   * Enable/disable dump io from browser
   *
   * @type {boolean}
   * @default {true}
   */
  BROWSER_DUMP_IO: true,
};

class EnvParams {
  constructor() {
    Object.keys(DEFAULT_ENV_PARAMS).forEach((key) => {
      const envVariableName = `${EnvParams.PREFIX}${key}`;
      if (Object.prototype.hasOwnProperty.call(process.env, envVariableName)) {
        this[key] = process.env[envVariableName];
      }
    });
  }
}

EnvParams.PREFIX = 'PURR_CONFIG_';

module.exports = {
  EnvParams,
};
