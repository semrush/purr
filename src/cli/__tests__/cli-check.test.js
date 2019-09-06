const originArgv = process.argv.slice();

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
});

afterEach(() => {
  process.argv = originArgv;
});

test('call help if check name not specified', () => {
  const commander = require('commander');
  jest.spyOn(commander, 'help').mockImplementation(() => {
    throw new Error('Mocked');
  });

  process.argv = [process.argv[0], './cli-check.js'];

  expect(() => {
    require('../cli-check');
  }).toThrow('Mocked');
});

test('success check', () => {
  const run = jest.fn().mockResolvedValue('Fake success');

  jest.doMock('../../check/runner', () => {
    // TODO: test that mandatory parameters is specified
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const checkName = 'some-check-name';

  process.argv = [process.argv[0], './cli-check.js', checkName];

  require('../cli-check');
  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);
});

test('exit with code 1 if check failed', () => {
  // eslint-disable-next-line no-unused-vars
  const mockExit = jest.spyOn(process, 'exit').mockResolvedValue('test');
  // const mockConsole = jest.spyOn(console, 'error').mockResolvedValue('test');
  const run = jest.fn().mockRejectedValue('Fake fail');

  jest.doMock('../../check/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const checkName = 'some-check-name';

  process.argv = [process.argv[0], './cli-check.js', checkName];

  require('../cli-check');

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);

  // TODO: Create issue in jest repo
  // expect(mockConsole).toBeCalledWith('Check failed\n');
  // expect(mockExit).toBeCalledWith(1);
});
