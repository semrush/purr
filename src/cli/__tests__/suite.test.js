const originArgv = process.argv.slice();

let logInfo;
let logError;
let processExit;

const exitErrorText = 'process.exit prevented in tests. Code:';

const suiteName = 'some-suite-name';

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

test.each([true, false])(
  'exit with code 0 if suite is complete successful',
  async (useRedis) => {
    const expectedResult = {
      shortMessage: 'Fake success',
      success: true,
    };

    let usedQueue;
    const run = jest.fn().mockResolvedValue(expectedResult);

    if (useRedis) {
      jest.doMock('../../queue/RedisQueue');
    }

    jest.doMock('../../suite/runner', () => {
      return jest.fn().mockImplementation((queue) => {
        usedQueue = queue;
        return { run };
      });
    });

    const a = require('../suite');

    await expect(a.run(suiteName, useRedis)).resolves.toBeUndefined();

    if (useRedis) {
      const RedisQueue = require('../../queue/RedisQueue');
      expect(usedQueue).toBeInstanceOf(RedisQueue);
      expect(RedisQueue).toBeCalledTimes(1);
    } else {
      expect(usedQueue).toBeUndefined();
    }

    expect(run).toBeCalledTimes(1);
    expect(run).toBeCalledWith(suiteName);

    expect(logInfo).toBeCalled();
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.stringContaining('true')
    );
  }
);

test('exit with code 1 if suite is complete but not successful', async () => {
  const expectedResult = {
    shortMessage: 'Fake fail',
    success: false,
  };

  const run = jest.fn().mockResolvedValue(expectedResult);

  jest.doMock('../../suite/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const a = require('../suite');

  await expect(a.run(suiteName)).rejects.toThrow(exitErrorText);

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(suiteName);

  expect(logError).toBeCalled();
  expect(logError).toBeCalledWith(
    'Suite failed\n',
    expect.stringContaining('false')
  );

  expect(processExit).toBeCalled();
  expect(processExit).toBeCalledWith(1);
});

test('exit with code 1 if suite failed', async () => {
  const suiteRunResult = 'Fake unexpected fail';
  const run = jest.fn().mockRejectedValue(suiteRunResult);

  jest.doMock('../../suite/runner', () => {
    return jest.fn().mockImplementation(() => {
      return { run };
    });
  });

  const a = require('../suite');

  await expect(a.run(suiteName)).rejects.toThrow(exitErrorText);

  expect(run).toBeCalledTimes(1);
  expect(run).toBeCalledWith(suiteName);

  expect(logError).toBeCalled();
  expect(logError).toBeCalledWith(
    'Suite failed\n',
    expect.stringContaining(suiteRunResult)
  );

  expect(processExit).toBeCalled();
  expect(processExit).toBeCalledWith(1);
});
