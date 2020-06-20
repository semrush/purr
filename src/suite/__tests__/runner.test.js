jest.mock('../../config');
jest.mock('../../check/runner');

const SuiteRunner = require('../runner');
const SimpleQueue = require('../../queue/SimpleQueue');
const { SuiteReport } = require('../../report/suite');

test('successful suite', () => {
  const queue = new SimpleQueue();
  const runner = new SuiteRunner(queue);

  return runner.run('mocked-suite').then((data) => {
    expect(data).toBeInstanceOf(SuiteReport);
    expect(data.success).toEqual(true);
    expect(data.checks[0].name).toEqual('mocked-check');
  });
});

test('failing suite', async () => {
  const runner = new SuiteRunner();

  const data = await runner.run('failing-mocked-suite', Math.random());

  expect(data).toBeInstanceOf(SuiteReport);
  expect(data.success).toEqual(false);
  expect(data.checks[0].success).toEqual(true);
  expect(data.checks[1].success).toEqual(false);
});

test('suite with exception', () => {
  const runner = new SuiteRunner();

  return runner
    .run('mocked-suite-with-exception', Math.random())
    .then((data) => {
      expect(data).toBeInstanceOf(SuiteReport);
      expect(data.success).toEqual(false);
      expect(data.checks[0].success).toEqual(true);
      expect(data.checks[1]).toBeInstanceOf(Error);
    });
});

test('unknown suite', async () => {
  const runner = new SuiteRunner();

  await expect(
    runner.run('unexisted-mocked-suite', Math.random())
  ).rejects.toThrowError(
    "Suite with name 'unexisted-mocked-suite' does not exist"
  );
});

test('fail when name argument is not specified', () => {
  const runner = new SuiteRunner();
  expect(runner.run()).rejects.toThrow("Mandatory parameter 'name' is missing");
});
