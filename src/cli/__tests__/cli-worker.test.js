jest.mock('../../queue/RedisQueueWorker');
jest.mock('../../check/runner');

const originArgv = process.argv.slice();

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
});

afterEach(() => {
  process.argv = originArgv;
});

describe('run', () => {
  test('success run', () => {
    process.argv = [process.argv[0], './cli-worker.js', 'check'];

    const consoleInfoMock = jest
      .spyOn(console, 'info')
      .mockImplementation(() => {});

    require('../cli-worker');

    expect(consoleInfoMock).toHaveBeenCalledWith(
      expect.stringContaining("Running worker on queue 'checks-queue'")
    );
  });
});

describe('validate parameters', () => {
  test('call help if worker type not specified', () => {
    const commander = require('commander');
    jest.spyOn(commander, 'help').mockImplementation(() => {
      throw new Error('Mocked');
    });

    process.argv = [process.argv[0], './cli-worker.js'];

    expect(() => {
      require('../cli-worker');
    }).toThrow('Mocked');
  });

  test.each([['dummy', "Worker with name 'dummy' does not exist"]])(
    'do not run worker for unknown type %s',
    (type, message) => {
      process.argv = [process.argv[0], './cli-worker.js', type];

      const consoleErrorMock = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});

      require('../cli-worker');

      expect(consoleErrorMock).toHaveBeenCalledWith(
        expect.stringContaining(message)
      );
      expect(exitMock).toHaveBeenCalledWith(1);
    }
  );
});
