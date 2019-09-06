const utils = require('../utils');

/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */
class BaseQueue {
  async close() {
    throw new Error('Not implemented');
  }

  async add(
    name = utils.mandatory('name'),
    checkId = utils.mandatory('checkId'),
    params = {}
  ) {
    throw new Error('Not implemented');
  }
}
/* eslint-enable class-methods-use-this */
/* eslint-enable no-unused-vars */

module.exports = BaseQueue;
