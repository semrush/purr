const path = require('path');

const config = jest.genMockFromModule('../config');

const configMock = {
  concurrency: 3,

  checksDir: path.resolve(__dirname, 'checks'),
  suitesDir: path.resolve(__dirname, 'suites'),
  parametersInfoFilePath: path.resolve(__dirname, './parameters.yml'),
  schedulesFilePath: path.resolve(__dirname, './schedules.yml'),
  reports: false,
  traces: false,
  screenshots: false,
  consoleLog: false,
};

module.exports = Object.assign(config, configMock);
