/* eslint-disable no-console */
const config = require('./config');
const utils = require('./utils');

const Levels = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
};

// TODO: Inject log level to message
function prepareMessage(message = utils.mandatory('message')) {
  const messageDate = new Date().toISOString();
  let messageString = message;

  if (typeof messageString !== 'string') {
    messageString = JSON.stringify(messageString);
  }

  return `[${messageDate}] ${messageString}`;
}

class Logger {
  constructor() {
    this.level = Levels[config.logLevel];
  }

  debug(message = utils.mandatory('message'), optionalParams) {
    if (this.level > Levels.debug) return;

    const preparedMessage = prepareMessage(message);

    if (optionalParams === undefined) {
      console.debug(preparedMessage);
    } else {
      console.debug(preparedMessage, optionalParams);
    }
  }

  info(message = utils.mandatory('message'), optionalParams) {
    if (this.level > Levels.info) return;

    const preparedMessage = prepareMessage(message);

    if (optionalParams === undefined) {
      console.info(preparedMessage);
    } else {
      console.info(preparedMessage, optionalParams);
    }
  }

  warn(message = utils.mandatory('message'), optionalParams) {
    if (this.level > Levels.warning) return;

    const preparedMessage = prepareMessage(message);

    if (optionalParams === undefined) {
      console.warn(preparedMessage);
    } else {
      console.warn(preparedMessage, optionalParams);
    }
  }

  error(message = utils.mandatory('message'), optionalParams) {
    if (this.level > Levels.error) return;

    const preparedMessage = prepareMessage(message);

    if (optionalParams === undefined) {
      console.error(preparedMessage);
    } else {
      console.error(preparedMessage, optionalParams);
    }
  }
}

module.exports = Logger;
