const path = require('path');

const config = jest.genMockFromModule('../config');

const configMock = {
  concurrency: 3,
  checksFilePath: path.resolve(__dirname, './checks.yml'),
  suitesFilePath: path.resolve(__dirname, './suites.yml'),
  parametersInfoFilePath: path.resolve(__dirname, './parameters.yml'),
  schedulesFilePath: path.resolve(__dirname, './schedules.yml'),
  traces: false,
  screenshots: false,
  consoleLog: false,
};

module.exports = Object.assign(config, configMock);
