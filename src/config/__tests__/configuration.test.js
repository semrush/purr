const { EnvParams } = require('../env');
const { Configuration } = require('../configuration');

describe('Test Configuration class', () => {
  it('Should initialize with default configuration', () => {
    const envParams = new EnvParams();
    const rootDir = '/rootDir/appDir';
    const configuration = new Configuration(envParams, rootDir);

    const defaultConfiguration = {
      apiUrlPrefix: '/api/v1',
      apiWaitTimeout: 27000,
      artifactsDir: '/rootDir/storage',
      artifactsGroupByCheckName: false,
      artifactsKeepSuccessful: true,
      artifactsTempDir: '/rootDir/storage_tmp',
      blockedResourceDomains: [],
      browserDumpIO: false,
      browserHeadless: true,
      browserProtocolTimeout: 180000,
      checksDir: '/rootDir/data/checks',
      checksQueueName: 'checks-queue',
      chromiumLaunchArgs: [],
      chromiumRemoteDebugging: false,
      chromiumRemoteDebuggingAddress: '127.0.0.1',
      chromiumRemoteDebuggingPort: 9222,
      concurrency: 4,
      consoleLog: true,
      consoleLogDir: '/rootDir/storage/console_log',
      cookieTracking: false,
      cookieTrackingHideValue: true,
      defaultPriorityLabel: 'p3',
      defaultProductLabel: '',
      defaultTeamLabel: 'sre',
      defaultAppNameLabel: '',
      defaultAppLinkLabel: '',
      defaultSlackChannelLabel: '',
      envVarParamPrefix: 'PURR_PARAM_',
      hars: false,
      harsDir: '/rootDir/storage/hars',
      harsTempDir: '/rootDir/storage_tmp/hars',
      latestFailedReports: true,
      logLevel: 'info',
      navigationTimeout: 30000,
      parametersInfoFilePath: '/rootDir/data/parameters.yml',
      redisHost: 'redis',
      redisJobTTL: 60000,
      redisPassword: '',
      redisPort: 6379,
      reports: true,
      reportsDir: '/rootDir/storage/reports',
      schedulesFilePath: '/rootDir/data/schedules.yml',
      screenshots: true,
      screenshotsDir: '/rootDir/storage/screenshots',
      sentryAttachStacktrace: false,
      sentryDSN: '',
      sentryDebug: false,
      sentryEnvironment: 'production',
      sentryRelease: '',
      suitesDir: '/rootDir/data/suites',
      traces: true,
      tracesDir: '/rootDir/storage/traces',
      tracesTempDir: '/rootDir/storage_tmp/traces',
      userAgent: 'uptime-agent',
      windowHeight: 1080,
      windowWidth: 1920,
    };

    expect(configuration).toEqual(defaultConfiguration);
  });

  it('Should process blocked domains list', () => {
    const envParams = new EnvParams();
    envParams.BLOCKED_RESOURCE_DOMAINS = 'example.com, SEMRUSH.COM , localHost';
    const rootDir = '/rootDir/src';

    const config = new Configuration(envParams, rootDir);

    const expectedBlockedResourceDomains = [
      'example.com',
      'semrush.com',
      'localhost',
    ];

    expect(config.blockedResourceDomains).toEqual(
      expectedBlockedResourceDomains
    );
  });

  it('Should process chromiumLaunchArgs', () => {
    const envParams = new EnvParams();
    envParams.CHROMIUM_LAUNCH_ARGS =
      'argument1, useBigScreen, useragent=sometext';

    const config = new Configuration(envParams, '/rootDir');

    const expectedChromiumLaunchArgs = [
      'argument1',
      'useBigScreen',
      'useragent=sometext',
    ];

    expect(config.chromiumLaunchArgs).toEqual(expectedChromiumLaunchArgs);
  });
});
