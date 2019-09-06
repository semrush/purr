jest.mock('bull');

jest.mock('../../config');
jest.mock('../../check/runner');

const RedisQueueWorker = require('../RedisQueueWorker');

describe('Calls', () => {
  test('fail when `concurrency` is not specified', async () => {
    await expect(() => {
      new RedisQueueWorker();
    }).toThrow("Mandatory parameter 'queueName' is missing");
  });

  test('fail when `concurrency` is not specified', async () => {
    await expect(() => {
      new RedisQueueWorker('queueName');
    }).toThrow("Mandatory parameter 'concurrency' is missing");
  });

  test('fail when `processor` is not specified', async () => {
    await expect(() => {
      new RedisQueueWorker('queueName', 1);
    }).toThrow("Mandatory parameter 'processor' is missing");
  });

  test('fail when `name` is not a string', async () => {
    await expect(new RedisQueueWorker('queueName', 1, () => {})).toBeInstanceOf(
      RedisQueueWorker
    );
  });
});

describe('Start', () => {
  let worker;
  const processor = jest.fn();

  beforeEach(async () => {
    worker = new RedisQueueWorker('queueName', 1, processor);
  });

  afterEach(async () => {
    await worker.stop();
  });

  test('start', async () => {
    // TODO: Its should be more clever
    jest.spyOn(worker.bull, 'on').mockImplementation(() => worker.bull);

    await worker.start();

    expect(worker.bull.process).toBeCalledTimes(1);
  });
});
