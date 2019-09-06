const utils = require('../../utils');

class RedisQueueWorker {
  constructor(
    concurrency = utils.mandatory('concurrency'),
    processor = utils.mandatory('processor')
  ) {
    this.concurrency = concurrency;
    this.processor = processor;
    this.bull = {};
  }

  async start() {}
}

module.exports = RedisQueueWorker;
