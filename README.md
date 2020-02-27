<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Intro](#intro)
- [Configuration](#configuration)
- [CLI](#cli)
- [Scheduled jobs](#scheduled-jobs)
  - [Run worker](#run-worker)
  - [Apply schedules](#apply-schedules)
  - [Stop schedules](#stop-schedules)
- [REST API](#rest-api)
  - [Endpoints](#endpoints)
- [Writing checks](#writing-checks)
  - [Methods](#methods)
  - [Includes](#includes)
  - [Variables](#variables)
- [Development](#development)
  - [Tests](#tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Intro

PURR (SEMrush puppeteer runner) is a devops-friendly tool for browser testing and monitoring.

The goal of this project is to have single set of browser checks, that could be used as tests,
as canaries in CI/CD pipelines and as scenarios for production monitoring.

The tool uses puppeteer (https://pptr.dev/) to run standalone browsers (Chrome and Firefox are supported currently).

Checks results are stored as JSON reports, screenshots and traces.

PURR has three modes:
- CLI (mainly used in CI/CD pipelines)
- queue worker (scheduled monitoring)
- REST service (show results and expose internal metrics for prometheus)

# Configuration

### data/checks.yml
Stores descriptions of every single check

### data/suites.yml
Organizes checks into suites

### data/parameters.yml
Specifies check parameters, i.e. target host or cookie values

### data/schedules.yml
Define your schedules here

### priority of parameters
- Defaults from parameters.yml
- Defaults from check
- Params from env
- Explicitly specified params



# CLI

### Build
```bash
docker build -f ./docker/Dockerfile . -t puppeteer-runner:latest
```

### Run single check
```bash
docker run -v "${PWD}/storage:/src/app/storage" puppeteer-runner:latest ./src/cli/cli.js check semrush-com
```

### Run suite
```bash
docker run -v "${PWD}/storage:/src/app/storage" puppeteer-runner:latest ./src/cli/cli.js suite semrush-suite
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

### Traces

Open trace in [Chrome DevTools Timeline Viewer](https://chromedevtools.github.io/timeline-viewer/).



# Scheduled jobs


## Run worker

```bash
APP_IMAGE_NAME="puppeteer-runner" APP_IMAGE_VERSION="latest" NGINX_IMAGE_NAME="nginx" docker-compose up

```

## Apply schedules

```bash
docker-compose exec worker /app/src/cli.js schedule clean
docker-compose exec worker /app/src/cli.js schedule apply
```

## Stop schedules

```bash
docker-compose exec worker /app/src/cli.js schedule clean
```


# REST API


## Endpoints

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
```
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


# Writing checks

PURR translate scenatio steps described in ./data/checks.yml into method call of puppeteer.Page object
You can check [puppeteer reference documentation](https://github.com/GoogleChrome/puppeteer/blob/v1.19.0/docs/api.md#class-page) for up-to-date capabilities.

## Methods

List of methods which were tested by the PURR dev team

      - goto:
          - '{{ TARGET_SCHEMA }}://{{ TARGET_DOMAIN }}/{{ TARGET_PAGE }}/'

      - goto:
          - '{{ TARGET_SCHEMA }}://{{ TARGET_DOMAIN }}/{{ TARGET_PAGE }}/'
          - waitUntil: networkidle2

      - waitForNavigation:
          - waitUntil: domcontentloaded

      - click:
          - {{ CSS_OR_DOM_SELECTOR }}

      - type:
        - {{ CSS_OR_DOM_SELECTOR }}
        - {{ STRING_TO_TYPE }}

      - waitForSelector:
          - {{ CSS_OR_DOM_SELECTOR }}

      - waitForSelector:
          - {{ CSS_OR_DOM_SELECTOR }}
          - contains: {{ EXPECTED_TEXT }}

      - setCookie:
          - name: {{ COOKIE_NAME }}
            value: {{ COOKIE_VALUE }}
            domain: .{{ TARGET_DOMAIN.split('.').slice(-2).join('.') }}

## Includes

Feel free to use YAML includes in your scenatios

    .login_via_popup: &login_via_popup
      - click:
        - '[data-test="login"]'
      - waitForSelector:
        - '[data-test="email"]'
      - type:
        - '[data-test="email"]'
        - {{USER_EMAIL}}
      - type:
        - '[data-test="password"]'
        - {{USER_PASSWORD}}
      - click:
        - '[data-test="login-submit"]'

    checks:
      logged-user-dashboard:
        parameters:
          USER_PASSWORD: secret
        steps:
          - goto:
            - {{ TARGET_URL }}
            - waitUntil: networkidle2
          <<: *login_via_popup
            parameters:
              USER_EMAIL: root@localhost
          - waitForSelector:
            - '[data-test="user-profile"]'
            - contains: 'User Name:'

## Variables

You can specify parameters in checks and suites yaml files under 'parameters' key

    parameters:
      TARGET_HOST: localhost

    checks:
      parameters:
        USER_EMAIL: root@localhost
        USER_PASSOWRD: secret

      valid-password:
        <<: *login_via_popup

      invalid-password:
        <<: *login_via_popup
          parameters:
            USER_PASSOWRD: invalid

## Proxy

To run a check throw proxy use 'proxy' key

```
  check-page-from-india:
    proxy: 'socks5h://user:password@india-proxy.service:8080'
    steps:
      - goto:
          - {{ TARGET_URL }}
      - waitForSelector:
          - body
          - contains: 'Your location: India'
```

# Development

> **IMPORTANT**: It's expected that for convenient experience you will use [vscode](https://code.visualstudio.com/) as an IDE with recommended extensions(configs are available in this repository).

```
make start-dev
make attach-dev
```

## Tests

Run tests:
```
npm run test
```

### Mocks
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


#### Be careful
Methods `mock`\\`unmock` must be executed before module imports and in the
same scope.
Mocks state restoring after each test, but only when you did not used
`jest.mock()`
