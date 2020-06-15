const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');

jest.mock('puppeteer');
jest.mock('../../config');

const CheckRunner = require('../runner');
const SimpleQueue = require('../../queue/SimpleQueue');
const { CheckReport } = require('../../report/check');

const browser = {
  newPage: async () => {
    return {
      setDefaultNavigationTimeout: async () => {},
      on: async () => {},
      someAction: async () => {
        return 'someActionReturn';
      },
      anotherAction: async () => {
        return 'anotherActionReturn';
      },
      errorAction: async () => {
        return Promise.reject(new Error('This action must fail'));
      },
      tracing: {
        start: async () => {},
        stop: async () => {},
      },
    };
  },
  close: async () => {},
};
const queue = new SimpleQueue();
const runner = new CheckRunner(queue);

test('CheckRunner arguments', () => {
  expect(() => {
    return new CheckRunner();
  }).toThrowError("Mandatory parameter 'queue' is missing");
});

test('doCheck', () => {
  puppeteer.launch.mockResolvedValue(browser);

  return runner.doCheck('mocked-check', uuidv4()).then((data) => {
    expect(data).toBeInstanceOf(CheckReport);
    expect(data.name).toEqual('mocked-check');
    expect(data.success).toEqual(true);
  });
});

test.each([0.9, 90, Number])(
  'fail when doCheck checkId arg is not a string',
  async (checkId) => {
    puppeteer.launch.mockResolvedValue(browser);

    await expect(runner.doCheck('mocked-check', checkId)).rejects.toThrowError(
      'Param checkId should be string, not '
    );
  }
);

test('run', () => {
  puppeteer.launch.mockResolvedValue(browser);

  return runner.run('mocked-check').then((data) => {
    expect(data).toBeInstanceOf(CheckReport);
    expect(data.name).toEqual('mocked-check');
    expect(data.success).toEqual(true);
  });
});

test('check-with-exception', () => {
  puppeteer.launch.mockResolvedValue(browser);

  expect.assertions(2);

  return runner.doCheck('check-with-exception', uuidv4()).catch((report) => {
    expect(report).toBeInstanceOf(CheckReport);
    expect(report).toEqual(
      expect.objectContaining({
        shortMessage: "Action 'errorAction' failed: This action must fail",
        success: false,
      })
    );
  });
});
