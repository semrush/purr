const puppeteer = require('puppeteer');

jest.mock('puppeteer');
jest.mock('../../config');

const CheckRunner = require('../runner');
const SimpleQueue = require('../../queue/SimpleQueue');
const { CheckReport } = require('../report');

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
        return Promise.reject();
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

  return runner.doCheck('mocked-check', Math.random()).then((data) => {
    expect(data).toBeInstanceOf(CheckReport);
    expect(data.name).toEqual('mocked-check');
    expect(data.success).toEqual(true);
  });
});

test('run', () => {
  puppeteer.launch.mockResolvedValue(browser);

  return runner.run('mocked-check').then((data) => {
    expect(data).toBeInstanceOf(CheckReport);
    expect(data.name).toEqual('mocked-check');
    expect(data.success).toEqual(true);
  });
});

test.skip('check-with-exception', () => {
  puppeteer.launch.mockResolvedValue(browser);

  return runner.doCheck('check-with-exception', Math.random()).then((data) => {
    expect(data).toBeInstanceOf(CheckReport);
    expect(data.success).toEqual(false);
  });
});
