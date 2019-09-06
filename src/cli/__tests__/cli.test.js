const originArgv = process.argv.slice();

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
});

afterEach(() => {
  process.argv = originArgv;
});

test('call help if command not specified', () => {
  const commander = require('commander');
  jest.spyOn(commander, 'outputHelp').mockImplementation(() => {
    throw new Error('Mocked');
  });

  process.argv = [process.argv[0], './cli.js'];

  expect(() => {
    require('../cli');
  }).toThrow('Mocked');
});
