const winston = require('winston');

const config = require('./config');

const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.metadata(),
    winston.format.json()
  ),
  defaultMeta: { service: 'purr' },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      // TODO: Doesn't work: https://github.com/winstonjs/winston/issues/1673
      // handleRejections: true,
    }),
  ],
});

// TODO: Should there be a better solution?
if (process.env.PRETTY_LOG) {
  const cliTransport = new winston.transports.Console({
    format: winston.format.prettyPrint({ depth: 0 }),
  });

  logger.clear().add(cliTransport);
}

module.exports = logger;
