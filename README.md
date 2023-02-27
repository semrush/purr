# PURR

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [PURR](#purr)
  - [Intro](#intro)
  - [Configuration](#configuration)
  - [CLI](#cli)
  - [Scheduled jobs](#scheduled-jobs)
  - [REST API](#rest-api)
  - [Writing checks](#writing-checks)
  - [Development](#development)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Intro

PURR (PUppeteer RunneR) is a devops-friendly tool for browser testing and monitoring.

The goal of this project is to have single set of browser checks, that could be used as tests, canaries in CI/CD pipelines and scenarios for production monitoring.

The tool uses puppeteer (<https://pptr.dev/>) to run standalone browsers (Chrome and Firefox are supported currently).

Checks results are stored as JSON reports, screenshots, traces and HAR files.

PURR has three modes:

- [CLI](README.md#cli) (mainly used in CI/CD pipelines)
- [Queue worker](README.md#scheduled-jobs) (scheduled monitoring checks)
- [REST service](README.md#rest-api) (show results and expose internal metrics for prometheus)

## Configuration

### data/checks dir

Stores descriptions of every single check

### data/suites dir

Organizes checks into suites

### data/parameters.yml

Specifies check parameters, i.e. target host or cookie values

### data/schedules.yml

Define your schedules here

### priority of parameters

- Defaults from parameters.yml
- Defaults from check/suite
- Params from env
- Explicitly specified params

### PURR configuration

You can configure PURR behaviour using environmental variables. Please see the [ENV.md](./ENV.md) for details.

## CLI

### Build

```bash
docker compose -f docker-compose.single.yml build
```

### Run single check

```bash
docker compose -f docker-compose.single.yml run purr check semrush-com
```

### Run suite

```bash
docker compose -f docker-compose.single.yml run purr suite semrush-suite
```

### Results

```bash
$ tree storage
storage
├── console_log
│   ├── console_semrush-com_0cedaca3-1153-47df-a616-55e21bf54635.log
│   └── console_semrush-com_ded5990f-7638-48e6-9d0e-77f8dba376fd.log
├── screenshots
│   ├── screenshot_semrush-com_0cedaca3-1153-47df-a616-55e21bf54635.png
│   └── screenshot_semrush-com_ded5990f-7638-48e6-9d0e-77f8dba376fd.png
└── traces
    ├── trace_semrush-com_0cedaca3-1153-47df-a616-55e21bf54635.json
    └── trace_semrush-com_ded5990f-7638-48e6-9d0e-77f8dba376fd.json

```

### Traces and HARs

PURR have a feature to save Chromium traces and [HARs](<https://en.wikipedia.org/wiki/HAR_(file_format)>).

You can open traces in Chromium Devtools Network Inspector or [Chrome DevTools Timeline Viewer](https://chromedevtools.github.io/timeline-viewer/).
For HAR you can use [GSuite Toolbox HAR Analyze](https://toolbox.googleapps.com/apps/har_analyzer/).

## Scheduled jobs

### Run worker

```bash
APP_IMAGE_NAME="puppeteer-runner" APP_IMAGE_VERSION="latest" NGINX_IMAGE_NAME="nginx" docker-compose up

```

### Apply schedules

```bash
docker compose exec worker schedule clean
docker compose exec worker schedule apply
```

### Stop schedules

```bash
docker compose exec worker schedule clean
```

## REST API

To access REST api you can use [traefik](TRAEFIK.md)

### Endpoints

#### `GET /metrics`

Prometheus metrics

#### `GET /api/v1/checks`

List of existing checks

##### query strings

#### `POST /api/v1/checks/:name`

Add check to queue

##### Response

**200**: Returns check report
**202**: Returns id of created check job

##### Payload

- **name**: string
  Check name to run
- **params**: array
  Any check parameter

##### Query strings

- **wait**: bool
  **default**: false
  Just return link for report when false
- **view**: string
  **default**: json
  **options**: json, pretty
  Output format

##### Example:

```bash
curl -X POST \
  -d 'params[TARGET_SCHEMA]=http' \
  -d 'params[TARGET_DOMAIN]=rc.example.com' \
  http://purr.traefik.lcl/api/v1/checks/main-page?wait=true&view=pretty
```

#### `GET /api/v1/reports/:id`

Get report

##### Payload

- **id**: string
  Check report id

##### Query strings

- **view**: string
  **default**: json
  **options**: json, pretty
  Output format

## Writing checks

PURR translates scenario steps described in ./data/checks into methods of puppeteer.Page object.
You can check [puppeteer reference documentation](https://github.com/GoogleChrome/puppeteer/blob/v1.19.0/docs/api.md#class-page) for up-to-date capabilities.

### Methods

List of methods which were tested by the PURR dev team

```yaml
- goto:
    - '{{ TARGET_SCHEMA }}://{{ TARGET_DOMAIN }}/{{ TARGET_PAGE }}/'

- goto:
    - '{{ TARGET_SCHEMA }}://{{ TARGET_DOMAIN }}/{{ TARGET_PAGE }}/'
    - waitUntil: networkidle2

- waitForNavigation:
    - waitUntil: domcontentloaded

- click:
    - '{{ CSS_OR_DOM_SELECTOR }}'

- type:
    - '{{ CSS_OR_DOM_SELECTOR }}'
    - '{{ STRING_TO_TYPE }}'

- waitForSelector:
    - '{{ CSS_OR_DOM_SELECTOR }}'

- setCookie:
    - name: '{{ COOKIE_NAME }}'
      value: '{{ COOKIE_VALUE }}'
      domain: .{{ TARGET_DOMAIN.split('.').slice(-2).join('.') }}
```

## Testing checks

to launch your check run 
```
make check name=main-page
```

### Custom Methods

Custom steps methods are described in [src/actions](./src/actions/common/index.js) dir and can be executed in checks.

```yaml
- actions.common.selectorContains:
    - '[data-test="user-profile"]'
    - 'User Name:'
```

### Includes

Feel free to use YAML anchors in your scenarios

```yaml
.login_via_popup: &login_via_popup
  - click:
    - '[data-test="login"]'
  - waitForSelector:
    - '[data-test="email"]'
  - type:
    - '[data-test="email"]'
    - '{{ USER_EMAIL }}'
  - type:
    - '[data-test="password"]'
    - '{{ USER_PASSWORD }}'
  - click:
    - '[data-test="login-submit"]'


logged-user-dashboard:
  parameters:
    USER_PASSWORD: secret
  steps:
    - goto:
      - '{{ TARGET_URL }}'
      - waitUntil: networkidle2
    <<: *login_via_popup
      parameters:
        USER_EMAIL: root@localhost
    - waitForSelector:
      - '[data-test="user-profile"]'
    - actions.common.selectorContains:
      - '[data-test="user-profile"]'
      - 'User Name:'
```

### Variables

You can specify parameters in checks and suites yaml files under 'parameters' key

```yaml
parameters:
  TARGET_HOST: localhost

valid-password:
  <<: *login_via_popup
  parameters:
    USER_EMAIL: root@localhost
    USER_PASSOWRD: secret

invalid-password:
  <<: *login_via_popup
  parameters:
    USER_PASSOWRD: invalid
```

### Proxy

To run a check, suite or schedule throw proxy use 'proxy' key

```yaml
check-page-from-india:
  proxy: 'socks5h://user:password@proxy.service:8080'
  steps:
    - goto:
        - '{{ TARGET_URL }}'
    - waitForSelector:
        - body
    - actions.common.selectorContains:
        - body
        - 'Your location: India'
```

## Development

Main entrypoint for project is `src/cli.js`.

There are two options for development avalaible.

* cli command development require only call from cli. [docker-compose.single.yml](docker-compose.single.yml) placed for your convinience
* client-server model. That mode described in [docker-compose.server.yml](docker-compose.server.yml). There we have two services avalaible
  * sever - provides api endpoint and other stuff related to daemon itself
  * worker - queue worker.


```bash
make start-dev
make attach-dev
```

### Tests

Run tests:

```bash
yarn run test
```

#### Mocks

We are using Jest testing framework.

You can mock module like that:

```javascript
// If `manual` mock exist in dir `__mocks__` along module file, will be used
// automatically.
//
// Mocked module methods return `undefined`, fields return actual value.
jest.mock('../../config');
```

```javascript
// Now `config` for all scripts will be `{ concurrency: 9 }`
jest.mock('../../config', () => ({ concurrency: 9 }));
```

Or like that:

```javascript
const config = require('../../config');

config.concurrency = 1;
config.getWorkingPath = jest.fn().mockImplementation(() => {
  return '/working/path';
});
```

##### Be careful

Methods `mock`\\`unmock` must be executed before module imports and in the
same scope.
Mocks state restoring after each test, but only when you did not used
`jest.mock()`
