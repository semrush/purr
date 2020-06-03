const originArgv = process.argv.slice();

let processExit;
const exitErrorText = 'process.exit prevented in tests. Code:';

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();

  processExit = jest
    .spyOn(process, 'exit')
    .mockName('processExit')
    .mockImplementation((code) => {
      throw Error(`${exitErrorText} ${code}`);
    });
});

afterEach(() => {
  process.argv = originArgv;
});

test('call help if suite name not specified', () => {
  const commander = require('commander');
  jest.spyOn(commander, 'outputHelp').mockName('commander.outputHelp');

  process.argv = [process.argv[0], './cli-suite.js'];

  expect(() => {
    require('../cli-suite');
  }).toThrow(exitErrorText);

  expect(commander.outputHelp).toBeCalledTimes(1);
  expect(processExit).toBeCalledTimes(1);
  expect(processExit).toBeCalledWith(1);
});

test.each([true, false])('run suite', (useRedis) => {
  const suite = require('../suite');
  suite.run = jest.fn().mockImplementation();

  const suiteName = 'some-suite-name';

  if (useRedis) {
    process.argv = [process.argv[0], './cli-suite.js', '--redis', suiteName];
  } else {
    process.argv = [process.argv[0], './cli-suite.js', suiteName];
  }

  require('../cli-suite');

  expect(suite.run).toBeCalledTimes(1);
  expect(suite.run).toBeCalledWith(suiteName, useRedis);
  expect(processExit).not.toBeCalled();
});
