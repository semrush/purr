jest.mock('../../queue/RedisQueueWorker');
jest.mock('../../check/runner');

const originArgv = process.argv.slice();

let logger;

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();

  jest.doMock('../../logger');
  logger = require('../../logger');
});

afterEach(() => {
  process.argv = originArgv;
});

describe('run', () => {
  test('success run', () => {
    process.argv = [process.argv[0], './cli-worker.js', 'check'];

    require('../cli-worker');

    expect(logger.info).toBeCalledWith('Running queue worker', {
      queue: 'checks-queue',
    });
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

  test('do not run worker for incorrect name', () => {
    const name = 'dummy';

    process.argv = [process.argv[0], './cli-worker.js', name];

    const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});

    require('../cli-worker');

    expect(logger.error).toHaveBeenCalledWith(
      'Worker with specified name does not exist',
      {
        name,
      }
    );
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
