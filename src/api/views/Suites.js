const config = require('../../config');
const { SuiteParser } = require('../../suite/parser');
const SuiteRunner = require('../../suite/runner');
const RedisQueue = require('../../queue/RedisQueue');

class Suites {
  static list(req, res) {
    res.send(new SuiteParser(config.suitesDir).getList());
  }

  static exec(req, res, next) {
    const queue = new RedisQueue(config.checksQueueName);
    const suiteRunner = new SuiteRunner(queue);

    suiteRunner
      .run(req.params.name)
      .then((report) => {
        res.send(report);
      })
      .catch(next)
      .finally(() => {
        queue.close();
      });
  }
}

module.exports = Suites;
