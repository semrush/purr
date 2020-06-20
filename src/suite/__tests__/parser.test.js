jest.mock('../../config');

const config = require('../../config');
const { SuiteParser } = require('../parser');

let parser;

beforeEach(async () => {
  parser = new SuiteParser(config.suitesFilePath);
});

describe('SuiteParser', () => {
  test('get list', () => {
    expect(parser.getList()).toEqual([
      'mocked-suite',
      'failing-mocked-suite',
      'mocked-suite-with-exception',
      'empty-suite',
      'empty-steps-suite',
    ]);
  });

  test('fail when name argument is not specified', () => {
    expect(() => {
      parser.getSuite();
    }).toThrow("Mandatory parameter 'name' is missing");
  });

  test('getSuiteSteps', () => {
    expect(parser.getSuiteSteps('mocked-suite')).toEqual([
      'mocked-check',
      'mocked-check-with-param',
    ]);
  });

  test('fail when trying to get non-existing suite', () => {
    expect(() => {
      parser.getSuiteSteps('unknown-suite');
    }).toThrow("Suite with name 'unknown-suite' does not exist");
  });

  test('fail when trying to get empty suite', () => {
    expect(() => {
      parser.getSuiteSteps('empty-suite');
    }).toThrow("Suite with name 'empty-suite' is empty");
  });

  test('fail when trying to get suite without steps', () => {
    expect(() => {
      parser.getSuiteSteps('empty-steps-suite');
    }).toThrow("Suite with name 'empty-steps-suite' has no steps");
  });

  test('fail when name argument is not specified', () => {
    expect(() => {
      parser.getSuiteSteps();
    }).toThrow("Mandatory parameter 'name' is missing");
  });

  test('proxy is null by default', () => {
    expect(parser.getSuiteProxy('empty-steps-suite')).toBe(null);
  });

  test('getSuiteProxy', () => {
    expect(parser.getSuiteProxy('mocked-suite')).toBe('some_url');
  });

  test('fail when name argument is not specified', () => {
    expect(() => {
      parser.getSuiteProxy();
    }).toThrow("Mandatory parameter 'name' is missing");
  });
});
