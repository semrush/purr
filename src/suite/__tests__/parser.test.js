jest.mock('../../config');

const config = require('../../config');
const { SuiteParser } = require('../parser');

let parser;

beforeEach(async () => {
  parser = new SuiteParser(config.suitesFilePath);
});

describe('SuiteParser', () => {
  test('get suite', () => {
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

  test('fail when name argument is not specified', () => {
    expect(() => {
      parser.getSuiteSteps();
    }).toThrow("Mandatory parameter 'name' is missing");
  });
});
