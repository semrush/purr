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

###priority of parameters
- Defaults from parameters.yml
- Defaults from check
- Params from env
- Explicitly specified params



# CLI (Quick start)

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


# Development
- Install ESLint and Jest for IDE

```
mkdir storage #(chown 1000:1000)
make start-dev
make attach-dev
```

For mac:
```
sudo mkdir ./storage ./storage/traces ./storage/screenshots ./storage/console_log
sudo chown -R 1000:1000 ./storage
sudo chmod 0777 -R ./storage
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
