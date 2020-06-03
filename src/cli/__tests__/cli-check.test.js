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

test('call help if check name not specified', () => {
  const commander = require('commander');
  jest.spyOn(commander, 'outputHelp').mockImplementation();

  process.argv = [process.argv[0], './cli-check.js'];

  expect(() => {
    require('../cli-check');
  }).toThrow(exitErrorText);

  expect(processExit).toBeCalled();
  expect(processExit).toBeCalledWith(1);
});

test('run check', () => {
  const check = require('../check');
  check.run = jest.fn().mockImplementation();

  const checkName = 'some-check-name';

  process.argv = [process.argv[0], './cli-check.js', checkName];

  require('../cli-check');

  expect(check.run).toBeCalledTimes(1);
  expect(check.run).toBeCalledWith(checkName);
  expect(processExit).not.toBeCalled();
});
