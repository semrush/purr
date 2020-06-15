const originArgv = process.argv.slice();

let logInfo;
let logError;
let processExit;

const exitErrorText = 'process.exit prevented in tests. Code:';

const suiteName = 'some-suite-name';

const successfulSuiteReport = {
  shortMessage: 'Fake suite success',
  success: true,
  checks: [
    {
      shortMessage: 'Fake check success',
      success: true,
      actions: ['fake action'],
    },
  ],
};

const failedSuiteReport = {
  shortMessage: 'Fake suite fail',
  success: false,
  checks: [
    {
      shortMessage: 'Fake check fail',
      success: false,
      actions: ['fake action'],
    },
  ],
};

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

describe('exit code', () => {
  test.each([true, false])(
    'code 0 if suite is complete successful. (redis: %s)',
    async (useRedis) => {
      let usedQueue;

      const run = jest.fn().mockResolvedValue(successfulSuiteReport);

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

      await expect(a.run(suiteName, useRedis, {})).resolves.toBeUndefined();

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

  test('code 1 if suite is complete but not successful', async () => {
    const expectedResult = {
      shortMessage: 'Fake fail',
      success: false,
      checks: [],
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

  test('code 1 if suite failed', async () => {
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
});

describe('suite options', () => {
  test('return full report if suite is complete successful', async () => {
    const run = jest.fn().mockResolvedValue(successfulSuiteReport);

    jest.doMock('../../suite/runner', () => {
      return jest.fn().mockImplementation(() => {
        return { run };
      });
    });

    const a = require('../suite');

    await expect(a.run(suiteName, false, {})).resolves.toBeUndefined();

    expect(run).toBeCalledTimes(1);
    expect(run).toBeCalledWith(suiteName);

    expect(logInfo).toBeCalled();
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.stringContaining('true')
    );
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.not.stringContaining('false')
    );
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.stringContaining('Fake suite success')
    );
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.stringContaining('fake action')
    );
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.stringContaining('Fake check success')
    );
  });

  test('shorten report if check is complete successful', async () => {
    const run = jest.fn().mockResolvedValue(successfulSuiteReport);

    jest.doMock('../../suite/runner', () => {
      return jest.fn().mockImplementation(() => {
        return { run };
      });
    });

    const a = require('../suite');

    await expect(
      a.run(suiteName, false, { reportOptions: { shorten: true } })
    ).resolves.toBeUndefined();

    expect(run).toBeCalledTimes(1);
    expect(run).toBeCalledWith(suiteName);

    expect(logInfo).toBeCalled();
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.stringContaining('true')
    );
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.not.stringContaining('false')
    );
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.stringContaining('Fake suite success')
    );
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.not.stringContaining('fake action')
    );
    expect(logInfo).toBeCalledWith(
      'Suite success\n',
      expect.not.stringContaining('Fake check success')
    );
  });

  test('not shorten report if check is complete but not successful', async () => {
    const run = jest.fn().mockResolvedValue(failedSuiteReport);

    jest.doMock('../../suite/runner', () => {
      return jest.fn().mockImplementation(() => {
        return {
          run,
        };
      });
    });

    const a = require('../suite');

    await expect(
      a.run(suiteName, false, {
        reportOptions: {
          shorten: true,
        },
      })
    ).rejects.toThrow(exitErrorText);

    expect(run).toBeCalledTimes(1);
    expect(run).toBeCalledWith(suiteName);

    expect(logError).toBeCalled();
    expect(logError).toBeCalledWith(
      'Suite failed\n',
      expect.stringContaining('false')
    );
    expect(logError).toBeCalledWith(
      'Suite failed\n',
      expect.not.stringContaining('true')
    );
    expect(logError).toBeCalledWith(
      'Suite failed\n',
      expect.not.stringContaining('Fake suite fail')
    );
    expect(logError).toBeCalledWith(
      'Suite failed\n',
      expect.not.stringContaining('fake action')
    );
    expect(logError).toBeCalledWith(
      'Suite failed\n',
      expect.not.stringContaining('Fake check fail')
    );
  });
});
