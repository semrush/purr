const originArgv = process.argv.slice();

let logger;
let processExit;

const exitErrorText = 'process.exit prevented in tests. Code:';

const checkName = 'some-check-name';

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();

  jest.doMock('../../logger');
  logger = require('../../logger');

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

test('return full report if check is complete successful', async () => {
  const expectedResult = {
    shortMessage: 'Fake success',
    success: true,
    actions: ['fake action'],
  };

  const run = jest.fn().mockResolvedValue(expectedResult);

  jest.doMock('../../check/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const a = require('../check');

  await expect(a.run(checkName, {})).resolves.toBeUndefined();

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);

  expect(logger.info).toBeCalled();
  expect(logger.info).toBeCalledWith('Check success', {
    report: expectedResult,
  });
});

test('shorten report if check is complete successful', async () => {
  const expectedResult = {
    success: true,
  };
  const report = {
    shortMessage: 'Fake success',
    actions: ['fake action'],
    ...expectedResult,
  };

  const run = jest.fn().mockResolvedValue(report);

  jest.doMock('../../check/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const a = require('../check');

  await expect(a.run(checkName, { shorten: true })).resolves.toBeUndefined();

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);

  expect(logger.info).toBeCalled();
  expect(logger.info).toBeCalledWith('Check success', {
    report: expectedResult,
  });
});

test('not shorten report if check is complete but not successful', async () => {
  const expectedResult = {
    shortMessage: 'Fake fail',
    success: false,
    actions: ['fake action'],
  };

  const run = jest.fn().mockResolvedValue(expectedResult);

  jest.doMock('../../check/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const a = require('../check');

  await expect(a.run(checkName, { shorten: true })).rejects.toThrow(
    exitErrorText
  );

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);

  expect(logger.error).toBeCalled();
  expect(logger.error).toBeCalledWith('Check failed', {
    report: expectedResult,
  });
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

  await expect(a.run(checkName, {})).resolves.toBeUndefined();

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);

  expect(logger.info).toBeCalled();
  expect(logger.info).toBeCalledWith('Check success', {
    report: expectedResult,
  });
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

  await expect(a.run(checkName, {})).rejects.toThrow(exitErrorText);

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);

  expect(logger.error).toBeCalled();
  expect(logger.error).toBeCalledWith('Check failed', {
    report: expectedResult,
  });

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

  await expect(a.run(checkName, {})).rejects.toThrow(exitErrorText);

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(checkName);

  expect(logger.error).toBeCalled();
  expect(logger.error).toBeCalledWith('Check failed', {
    report: 'Fake unexpected fail',
  });

  expect(processExit).toBeCalled();
  expect(processExit).toBeCalledWith(1);
});
