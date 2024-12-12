const utils = require('../utils');

 
 
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
 
 

module.exports = BaseQueue;
