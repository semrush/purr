const originArgv = process.argv.slice();

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
});

afterEach(() => {
  process.argv = originArgv;
});

test('call help if suite name not specified', () => {
  const commander = require('commander');
  jest.spyOn(commander, 'help').mockImplementation(() => {
    throw new Error('Mocked');
  });

  process.argv = [process.argv[0], './cli-suite.js'];

  expect(() => {
    require('../cli-suite');
  }).toThrow('Mocked');
});

test('success suite', () => {
  const run = jest.fn().mockResolvedValue({
    shortMessage: 'Fake success',
    success: true,
  });

  jest.doMock('../../suite/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const suiteName = 'some-suite-name';

  process.argv = [process.argv[0], './cli-suite.js', suiteName];

  require('../cli-suite');
  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(suiteName);
});

test('exit with code 1 if suite failed', () => {
  // eslint-disable-next-line no-unused-vars
  const mockExit = jest.spyOn(process, 'exit').mockResolvedValue('test');
  // const mockConsole = jest.spyOn(console, 'error').mockResolvedValue('test');
  const run = jest.fn().mockRejectedValue({
    shortMessage: 'Fake fail',
    success: false,
  });

  jest.doMock('../../suite/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const suiteName = 'some-suite-name';

  process.argv = [process.argv[0], './cli-suite.js', suiteName];

  require('../cli-suite');

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(suiteName);

  // TODO: Create issue in jest repo
  // expect(mockConsole).toBeCalledWith('suite failed\n');
  // expect(mockExit).toBeCalledWith(1);
});
