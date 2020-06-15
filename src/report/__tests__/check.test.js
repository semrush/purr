const {
  CheckReport,
  ActionReport,
  processReport,
  stringifyReport,
} = require('../check');

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

describe('report processing', () => {
  const failedReport = new CheckReport('name', 'id', false, 'shortMessage');
  const successfulReport = new CheckReport('name', 'id', true, 'shortMessage');

  test('default behavior', () => {
    const processed = processReport(successfulReport, {});

    expect(processed).toHaveProperty('name', 'name');
    expect(processed).toHaveProperty('id', 'id');
    expect(processed).toHaveProperty('success', true);

    expect(processed).toHaveProperty('shortMessage', 'shortMessage');
    expect(processed).toHaveProperty('actions', []);
  });

  test('hide actions', () => {
    const processed = processReport(successfulReport, { hideActions: true });

    expect(processed).toHaveProperty('name', 'name');
    expect(processed).toHaveProperty('id', 'id');
    expect(processed).toHaveProperty('success', true);

    expect(processed).toHaveProperty('shortMessage', 'shortMessage');
    expect(processed).not.toHaveProperty('actions');
  });

  test('successful is shorten', () => {
    const processed = processReport(successfulReport, { shorten: true });

    expect(processed).toHaveProperty('name', 'name');
    expect(processed).toHaveProperty('id', 'id');
    expect(processed).toHaveProperty('success', true);

    expect(processed).not.toHaveProperty('shortMessage', 'shortMessage');
    expect(processed).not.toHaveProperty('actions');
  });

  test('failed is not shorten', () => {
    const processed = processReport(failedReport, { shorten: true });

    expect(processed).toHaveProperty('name', 'name');
    expect(processed).toHaveProperty('id', 'id');
    expect(processed).toHaveProperty('success', false);

    expect(processed).toHaveProperty('shortMessage', 'shortMessage');
    expect(processed).toHaveProperty('actions', []);
  });
});

test('stringifyReport', () => {
  const report = new CheckReport('name', 'id', false, 'shortMessage');
  const action = new ActionReport('name', 'step', 'params', true);
  action.cookies = ['test'];
  report.actions = [action];

  const stringified = stringifyReport(report);

  expect(stringified).not.toContain('[Array]');
});
