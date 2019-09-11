const { SuiteReport } = require('../report');

const data = [
  'mocked-report',
  123,
  false,
  'mock',
  'An mocked report',
  new Date().toISOString(),
  new Date().toISOString(),
];
test.each([data])(
  'SuiteReport no checks',
  (
    name,
    id,
    success,
    shortMessage,
    fullMessage,
    startDateTime,
    endDateTime
  ) => {
    const report = new SuiteReport(
      name,
      id,
      success,
      shortMessage,
      fullMessage,
      startDateTime,
      endDateTime
    );

    expect(report.id).toEqual(id);
    expect(report.success).toEqual(success);
    expect(report.shortMessage).toEqual(shortMessage);
    expect(report.fullMessage).toEqual(fullMessage);
    expect(report.startDateTime).toEqual(startDateTime);
    expect(report.endDateTime).toEqual(endDateTime);
    expect(report.checks).toEqual([]);
  }
);
test.each([data.concat(['check1', 'check2'])])(
  'SuiteReport with checks',
  (
    name,
    id,
    success,
    shortMessage,
    fullMessage,
    startDateTime,
    endDateTime,
    checks
  ) => {
    const report = new SuiteReport(
      name,
      id,
      success,
      shortMessage,
      fullMessage,
      startDateTime,
      endDateTime,
      checks
    );
    expect(report.checks).toEqual(checks);
  }
);
