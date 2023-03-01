# PURR Configuration

## Configuration using environmental variables

Application can be configured using ENV variables. Variables can be passed either by giving
to the `docker-compose` command
or by adding to `.env` file (see [.env.sample](./.env.sample) for details).

User should tell `PURR_PARAM_*` variables from `PURR_CONFIG_*`. The first helps to configure tests behaviour,
while the second configures application itself.

List of available parameters, their default values and description are available bellow:

| Environment                            |                                                                                                          Description | Default value           |
|:---------------------------------------|---------------------------------------------------------------------------------------------------------------------:|:------------------------|
| PURR_CONFIG_DATA_DIR                   |                                                      Location of checks, suites, schedules and parameters for tests. | `./data`                |
| PURR_CONFIG_ARTIFACTS_DIR              |                                                                             Location, where to store results of runs | `./storage`             |
| PURR_CONFIG_ARTIFACTS_TEMP_DIR         |                                                                            Location of temporary storage for results | `./storage_tmp`         |
| PURR_CONFIG_CONCURRENCY                |                                                                Amount of concurrent processes when performing checks | `4`                     |
| PURR_CONFIG_PARAMETERS_INFO_FILE_PATH  |                                                                               Name of file with parameters, absolute | `./data/parameters.yml` |
| PURR_CONFIG_SCHEDULES_FILE_PATH        |                                                                                   Name of file with scheduled checks | `./data/schedules.yml`  |
| PURR_CONFIG_ARTIFACTS_KEEP_SUCCESSFUL  |                                                                      Whether to keep artifacts for successful checks | `true`                  |
| PURR_CONFIG_REPORTS                    |                                                                                Whether to generate test runs reports | `true`                  |
| PURR_CONFIG_REPORTS_DIR                |                                                                                        Where to store tests reports. | `./storage/reports`     |
| PURR_CONFIG_LATEST_FAILED_REPORTS      |                                                              Whether to generate test runs reports for failed checks | `true`                  |
| PURR_CONFIG_SCREENSHOTS                |                                                                           Whether to save screenshots for tests runs | `true`                  |
| PURR_CONFIG_SCREENSHOTS_DIR            |                                                                                            Where to save screenshots | `./storage/screenshots` |
| PURR_CONFIG_TRACES                     |                                                                                          Whether to store run traces | `true`                  |
| PURR_CONFIG_TRACES_DIR                 |                                                                                                Where to store traces | `./storage/traces`      | 
| PURR_CONFIG_HARS                       |                                                                                Whether to store HAR files for checks | `false`                 |
| PURR_CONFIG_HARS_DIR                   |                                                                                             Where to store HAR files | `./storage/hars`        |
| PURR_CONFIG_CONSOLE_LOG                |                                                                            Whether to store console logs from checks | `true`                  |
| PURR_CONFIG_CONSOLE_LOG_DIR            |                                                                                     Where to store console log files | `./storage/console_log` |
| PURR_CONFIG_ENV_VAR_PARAM_PREFIX       |                                                          Prefix for PARAMS when configuring them from env variables. | `PURR_PARAM_`           |
| PURR_CONFIG_WINDOW_WIDTH               |                                                                                    Default width of window for tests | `1920`                  |
| PURR_CONFIG_WINDOW_HEIGHT              |                                                                                   Default height of window for tests | `1080`                  |
| PURR_CONFIG_NAVIGATION_TIMEOUT         |                                                                       Default timeout for navigation in milliseconds | `30000`                 |   
| PURR_CONFIG_USER_AGENT                 |                                                                       Default user agent for requests from Puppeteer | `uptime-agent`          |
| PURR_CONFIG_LOG_LEVEL                  |                                                                                                                      | `info`                  |  
| PURR_CONFIG_BLOCKED_RESOURCE_DOMAINS   | List of domains to block in Puppeteer. One should use comma-separated string. For example: `google.com,facebook.com` |                         |  
| PURR_CONFIG_COOKIE_TRACKING            |                                                                Whether to add cookies from checks to action reports. | `false`                 |
| PURR_CONFIG_COOKIE_TRACKING_HIDE_VALUE |             Whether to hide cookies values from checks to action reports. Available only if COOKIE_TRACKING is true. | `true`                  |

For details please take a look at [src/config/env.js](./src/config/env.js) and [src/config.js](./src/config.js).
