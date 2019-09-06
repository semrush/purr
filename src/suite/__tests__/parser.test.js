jest.mock('../../config');

const config = require('../../config');
const { SuiteParser } = require('../parser');

let parser;

beforeEach(async () => {
  parser = new SuiteParser(config.suitesFilePath);
});

describe('SuiteParser', () => {
  test('getSuite', () => {
    expect(parser.getSuite('mocked-suite')).toEqual([
      'mocked-check',
      'mocked-check-with-param',
    ]);
  });

  test('getUnknownSuite', () => {
    expect(() => {
      parser.getSuite('unknown-suite');
    }).toThrow("Suite with name 'unknown-suite' does not exist");
  });

  test('getUnknownSuite', () => {
    expect(() => {
      parser.getSuite();
    }).toThrow("Mandatory parameter 'name' is missing");
  });

  test('parseEmptyData', () => {
    expect(() => {
      SuiteParser.parseSuite();
    }).toThrow("Mandatory parameter 'data' is missing");
  });
});
