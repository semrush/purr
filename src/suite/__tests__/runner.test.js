jest.mock('../../config');
jest.mock('../../check/runner');

const SuiteRunner = require('../runner');
const SimpleQueue = require('../../queue/SimpleQueue');
const { SuiteReport } = require('../report');

test('successful suite', () => {
  const queue = new SimpleQueue();
  const runner = new SuiteRunner(queue);

  return runner.run('mocked-suite', Math.random()).then((data) => {
    expect(data).toBeInstanceOf(SuiteReport);
    expect(data.success).toEqual(true);
    expect(data.checks[0].name).toEqual('mocked-check');
  });
});

test('failing suite', () => {
  const queue = new SimpleQueue();
  const runner = new SuiteRunner(queue);

  return runner.run('failing-mocked-suite', Math.random()).then((data) => {
    expect(data).toBeInstanceOf(SuiteReport);
    expect(data.success).toEqual(false);
  });
});

test('suite with exception', () => {
  const queue = new SimpleQueue();
  const runner = new SuiteRunner(queue);

  return runner
    .run('mocked-suite-with-exception', Math.random())
    .then((data) => {
      expect(data).toBeInstanceOf(SuiteReport);
      expect(data.success).toEqual(false);
    });
});

test('unknown suite', async () => {
  const queue = new SimpleQueue();
  const runner = new SuiteRunner(queue);

  await expect(
    runner.run('unexisted-mocked-suite', Math.random())
  ).rejects.toThrowError(
    "Suite with name 'unexisted-mocked-suite' does not exist"
  );
});
