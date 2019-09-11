jest.mock('../../config');

const config = require('../../config');
const { SuiteParser } = require('../parser');

let parser;

beforeEach(async () => {
  parser = new SuiteParser(config.suitesFilePath);
});

describe('SuiteParser', () => {
  test('get suite', () => {
    expect(parser.getSuite('mocked-suite')).toEqual([
      'mocked-check',
      'mocked-check-with-param',
    ]);
  });

  test('fail when trying to get non-existing suite', () => {
    expect(() => {
      parser.getSuite('unknown-suite');
    }).toThrow("Suite with name 'unknown-suite' does not exist");
  });

  test('fail when name argument is not specified', () => {
    expect(() => {
      parser.getSuite();
    }).toThrow("Mandatory parameter 'name' is missing");
  });

  test('fail when data argument is not specified', () => {
    expect(() => {
      SuiteParser.parseSuite();
    }).toThrow("Mandatory parameter 'data' is missing");
  });
});
