jest.mock('../../config');
jest.mock('../../check/runner');

const config = require('../../config');

describe.skip('Calls', () => {
  const RedisQueue = require('../RedisQueue');
  let queue;

  beforeEach(async () => {
    jest.doMock('bull');
    queue = new RedisQueue(config.checksQueueName);
  });

  afterEach(async () => {
    await queue.close();
  });

  test('fail when name is not specified', async () => {
    await expect(queue.add()).rejects.toThrow(
      "Mandatory parameter 'name' is missing"
    );
  });

  test('fail when checkId is not specified', async () => {
    await expect(queue.add(10)).rejects.toThrow(
      "Mandatory parameter 'checkId' is missing"
    );
  });

  test('fail when name is not a string', async () => {
    await expect(queue.add(10, 10, 10)).rejects.toThrow(
      "Task name should be 'string'"
    );
  });

  test('fail when params is not an object', async () => {
    await expect(queue.add('fake-check', 10, 10)).rejects.toThrow(
      "Task params should be 'object'"
    );
  });
});
