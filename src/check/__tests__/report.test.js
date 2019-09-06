const { CheckReport, ActionReport } = require('../report');

test('CheckReport constructor', () => {
  const report = new CheckReport(
    'name',
    'id',
    true,
    'shortMessage',
    'fullMessage',
    'tracePath',
    'screenshotPath',
    'consoleLogPath',
    new Date().toISOString(),
    new Date().toISOString(),
    []
  );
  expect(report).toBeInstanceOf(CheckReport);

  expect(report.name).toEqual('name');
  expect(report.id).toEqual('id');
  expect(report.success).toEqual(true);
  expect(report.shortMessage).toEqual('shortMessage');
  expect(report.fullMessage).toEqual('fullMessage');
  expect(report.tracePath).toEqual('tracePath');
  expect(report.screenshotPath).toEqual('screenshotPath');
  expect(report.consoleLogPath).toEqual('consoleLogPath');
  expect(report.actions).toEqual([]);
});

test('ActionReport constructor', () => {
  const report = new ActionReport(
    'name',
    'step',
    'params',
    true,
    'shortMessage',
    'fullMessage',
    new Date().toISOString(),
    new Date().toISOString()
  );
  expect(report).toBeInstanceOf(ActionReport);

  expect(report.name).toEqual('name');
  expect(report.step).toEqual('step');
  expect(report.params).toEqual('params');
  expect(report.success).toEqual(true);
  expect(report.shortMessage).toEqual('shortMessage');
  expect(report.fullMessage).toEqual('fullMessage');
});
