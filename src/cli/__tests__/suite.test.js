const originArgv = process.argv.slice();

let logger;
let processExit;

const exitErrorText = 'process.exit prevented in tests. Code:';

const suiteName = 'some-suite-name';

const successfulSuiteReportShort = {
  shortMessage: 'Fake suite success',
  success: true,
  checks: [
    {
      success: true,
    },
  ],
};

const successfulSuiteReport = {
  ...successfulSuiteReportShort,
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

      expect(logger.info).toBeCalled();
      expect(logger.info).toBeCalledWith('Suite success', {
        report: successfulSuiteReport,
      });
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

    expect(logger.error).toBeCalled();
    expect(logger.error).toBeCalledWith('Suite failed', {
      report: expectedResult,
    });

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

    expect(logger.error).toBeCalled();
    expect(logger.error).toBeCalledWith('Suite failed', {
      report: suiteRunResult,
    });

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

    expect(logger.info).toBeCalled();
    expect(logger.info).toBeCalledWith('Suite success', {
      report: successfulSuiteReport,
    });
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

    expect(logger.info).toBeCalled();
    expect(logger.info).toBeCalledWith('Suite success', {
      report: successfulSuiteReportShort,
    });
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

    expect(logger.error).toBeCalled();
    expect(logger.error).toBeCalledWith('Suite failed', {
      report: failedSuiteReport,
    });
  });
});
