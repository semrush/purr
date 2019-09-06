# Parameters flow
- Defaults from parameters.yml
- Defaults from check
- Params from env
- Explicitly specified params

# TODO: cli parameters from env and cli examples

# API

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


## TODO:
- [ ] Fix Content-Type of api check\report views
- [ ] Redis job TTL
- [ ] Fix silent fail when suite contains non-existent check
- [ ] Lint suites.yml for non-existent checks
- [ ] Catch errors for express views
- [ ] Singleton for prom /metrics
- [ ] Track non-closed puppeteer browser processes
- [ ] Add CLI parameter to concurrency and other config options
- [ ] Group check artifacts by check name, not artifact type
- [ ] Specify params for jobs in suite
- [ ] Add cache to gitlab-ci.yml
- [ ] Add check name to screenshot\trace\log along with hash
- [ ] CLI help about envvar params(PURR_PARAM_)
- [ ] Coverage threshold 98%
- [ ] Test for parameters with skipped `default` field
- [ ] Test for parameters with skipped fields
- [ ] Use prettier for yaml files
- [ ] Add doc
- [ ] Check viewport params. Are they need? (Use puppeteer.launch option)
- [ ] CLI silent mode
- [ ] CLI return valid JSON string
- [ ] Add params to check report
- [ ] add parameters validators
- [ ] add protected parameters
- [ ] getScenario was deleted and replaced by parseScenario. Check for duplicated tests
- [ ] restrict usage of parameters without specs in parameters.yml
- [ ] hide protected vars from log
- [ ] add suite fail one first cli option
- [ ] validate yaml files
- [ ] test for non closed browsers
- [ ] force `FIXME:` pre-commit
- [ ] https://code.visualstudio.com/docs/editor/extension-gallery#_workspace-recommended-extensions
- [ ] Check safety of check params from api
