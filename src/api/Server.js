const path = require('path');
const express = require('express');
const Sentry = require('@sentry/node');
const morgan = require('morgan');
const serveFavicon = require('serve-favicon');

const log = require('../logger');
const utils = require('../utils');
const config = require('../config');
const Metrics = require('./views/Metrics');
const Checks = require('./views/Checks');
const Reports = require('./views/Reports');

Sentry.init({
  dsn: config.sentryDSN,
  environment: config.sentryEnvironment,
  release: config.sentryRelease,
  debug: config.sentryDebug,
  attachStacktrace: config.sentryAttachStacktrace,
});
utils.logUnhandledRejections();

const port = 8080;

const app = express();

app.use(Sentry.Handlers.requestHandler());

app.use(morgan('combined'));
app.use(serveFavicon(path.join(__dirname, 'favicon-32x32.png')));
app.use(express.urlencoded({ extended: true }));

app.get('/metrics', Metrics.get);

const apiRouter = express.Router();
app.use(config.apiUrlPrefix, apiRouter);

apiRouter.get('/checks', Checks.list);
apiRouter.post('/checks/:name', Checks.exec);
apiRouter.get('/reports/:id', Reports.get);
apiRouter.get('/reports/:name/latest/failed', Reports.failed);

app.use(Sentry.Handlers.errorHandler());

class Server {
  static start() {
    app.listen(port, () => log.info('App listening on port', { port }));
  }
}

module.exports = Server;
