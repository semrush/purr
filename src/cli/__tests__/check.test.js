const originArgv = process.argv.slice();

let logInfo;
let logError;
let processExit;

const exitErrorText = 'process.exit prevented in tests. Code:';

const checkName = 'some-check-name';

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();

  logInfo = jest
    .fn()
    .mockName('logInfo')
    .mockImplementation();
  logError = jest
    .fn()
    .mockName('logError')
    .mockImplementation();

  processExit = jest
    .spyOn(process, 'exit')
    .mockName('processExit')
    .mockImplementation((code) => {
      throw Error(`${exitErrorText} ${code}`);
    });

  jest.doMock('../../Logger', () => {
    return jest.fn().mockImplementation(() => {
      return { info: logInfo, error: logError };
    });
  });
});

afterEach(() => {
  process.argv = originArgv;
});

test('exit with code 0 if check is complete successful', async () => {
  const expectedResult = {
    shortMessage: 'Fake success',
    success: true,
  };

  const run = jest.fn().mockResolvedValue(expectedResult);

  jest.doMock('../../check/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const a = require('../check');

  await expect(a.run(checkName)).resolves.toBeUndefined();

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);

  expect(logInfo).toBeCalled();
  expect(logInfo).toBeCalledWith(
    'Check success\n',
    expect.stringContaining('true')
  );
});

test('exit with code 1 if check is complete but not successful', async () => {
  const expectedResult = {
    shortMessage: 'Fake fail',
    success: false,
  };

  const run = jest.fn().mockResolvedValue(expectedResult);

  jest.doMock('../../check/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const a = require('../check');

  await expect(a.run(checkName)).rejects.toThrow(exitErrorText);

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);

  expect(logError).toBeCalled();
  expect(logError).toBeCalledWith(
    'Check failed\n',
    expect.stringContaining('false')
  );

  expect(processExit).toBeCalled();
  expect(processExit).toBeCalledWith(1);
});

test('exit with code 1 if check failed', async () => {
  const checkRunResult = 'Fake unexpected fail';
  const run = jest.fn().mockRejectedValue(checkRunResult);

  jest.doMock('../../check/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const a = require('../check');

  await expect(a.run(checkName)).rejects.toThrow(exitErrorText);

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);

  expect(logError).toBeCalled();
  expect(logError).toBeCalledWith(
    'Check failed\n',
    expect.stringContaining(checkRunResult)
  );

  expect(processExit).toBeCalled();
  expect(processExit).toBeCalledWith(1);
});
