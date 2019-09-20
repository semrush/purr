jest.mock('../../config');
jest.mock('../../check/runner');

describe('Calls', () => {
  const SimpleQueue = require('../SimpleQueue');
  let queue;

  beforeEach(async () => {
    queue = new SimpleQueue();
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

  test('return successful task result', async () => {
    await expect(queue.add('fake-check', 10)).resolves.toEqual(
      expect.objectContaining({
        shortMessage: 'Moked check is successful',
        success: true,
      })
    );
  });

  test('return failed task result', async () => {
    await expect(queue.add('failing-fake-check', 10)).resolves.toEqual(
      expect.objectContaining({
        shortMessage: 'Mocked failing check is failed',
        success: false,
      })
    );
  });
});

describe('Concurrency', () => {
  test('run many jobs with concurrency 1', async () => {
    const config = require('../../config');
    config.concurrency = 1;

    const SimpleQueue = require('../SimpleQueue');
    const queue = new SimpleQueue();

    let jobs = [];
    const jobsCount = 3;

    await [...Array(jobsCount)].forEach((_, i) => {
      jobs.push(queue.add('fake-check', i));
    });

    jobs = Promise.all(jobs);

    await expect(jobs).resolves.toBeTruthy();

    await jobs.then((values) => {
      expect(
        // ensure that all jobs were started after end of previous
        values.reduce((accumulator, value, index) => {
          if (value.startDateTime < accumulator.endDateTime) {
            throw new Error(
              `Task "${index}" started(${value.startDateTime}) before ` +
                `end(${accumulator.endDateTime}) of previous task`
            );
          }
          return value;
        })
      ).toEqual(
        expect.objectContaining({
          id: jobsCount - 1,
          startDateTime: expect.any(String),
          endDateTime: expect.any(String),
        })
      );
    });
  });

  test('run many jobs with concurrency 10', async () => {
    const config = require('../../config');
    config.concurrency = 10;

    const SimpleQueue = require('../SimpleQueue');
    const queue = new SimpleQueue();

    let jobs = [];
    const jobsCount = 3;

    await [...Array(jobsCount)].forEach((_, i) => {
      jobs.push(queue.add('fake-check', i));
    });

    jobs = Promise.all(jobs);

    await expect(jobs).resolves.toBeTruthy();

    await jobs.then((values) => {
      expect(
        // ensure that all jobs were started at about the same time
        values.reduce((accumulator, value, index) => {
          if (value.startDateTime >= accumulator.endDateTime) {
            throw new Error(
              `Task "${index}" started(${value.startDateTime}) after end(${accumulator.endDateTime}) of previous task`
            );
          }
          return value;
        })
      ).toEqual(
        expect.objectContaining({
          id: jobsCount - 1,
          startDateTime: expect.any(String),
          endDateTime: expect.any(String),
        })
      );
    });
  });
});
