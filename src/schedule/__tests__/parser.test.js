jest.mock('../../config');

const config = require('../../config');
const { ScheduleParser } = require('../parser');

let parser;

beforeEach(async () => {
  parser = new ScheduleParser(config.schedulesFilePath);
});

describe('SuiteParser', () => {
  test('get list', () => {
    expect(parser.getList()).toMatchInlineSnapshot(`
      [
        "schedule-full",
        "schedule-without-labels",
        "empty-schedule",
        "schedule-with-incorrect-labels-type",
        "schedule-with-incorrect-label-priority",
        "schedule-with-incorrect-labels",
      ]
    `);
  });

  test('fail when name argument is not specified', () => {
    expect(() => {
      parser.getSchedule();
    }).toThrow("Mandatory parameter 'name' is missing");
  });

  test('getSchedule', () => {
    expect(parser.getSchedule('schedule-full')).toMatchInlineSnapshot(`
      {
        "allowedCookies": [
          "/^regex_test{1,30}$/",
        ],
        "checks": [
          "mocked-check",
        ],
        "interval": 60000,
        "labels": {
          "appLink": "app-link",
          "appName": "some-app",
          "priority": "p1",
          "product": "some-product",
          "slackChannel": "app-slack",
          "team": "some-team",
        },
      }
    `);
  });

  test('fail when interval incorrect', () => {
    expect(() => {
      return parser.getSchedule('empty-schedule');
    }).toThrowErrorMatchingInlineSnapshot(
      `"Schedule should have interval in format "60(s|m)". Now: undefined"`
    );
  });

  test('default labels is null', () => {
    expect(parser.getSchedule('schedule-without-labels'))
      .toMatchInlineSnapshot(`
      {
        "allowedCookies": [
          "/^regex_test{1,30}$/",
        ],
        "checks": [
          "mocked-check",
        ],
        "interval": 60000,
        "labels": [],
      }
    `);
  });

  test('fail when labels incorrect', () => {
    expect(() => {
      parser.getSchedule('schedule-with-incorrect-labels-type');
    }).toThrowErrorMatchingInlineSnapshot(
      `"Schedule labels should be object, not string"`
    );
  });

  test('fail when label priority incorrect', () => {
    expect(() => {
      parser.getSchedule('schedule-with-incorrect-label-priority');
    }).toThrowErrorMatchingInlineSnapshot(
      `"This value is not allowed for label priority"p10""`
    );
  });

  test('fail when labels incorrect', () => {
    expect(() => {
      parser.getSchedule('schedule-with-incorrect-labels');
    }).toThrowErrorMatchingInlineSnapshot(
      `"Next schedule labels are not allowed "all-in-fire""`
    );
  });

  test('fail when trying to get non-existing schedule', () => {
    expect(() => {
      parser.getSchedule('unknown-schedule');
    }).toThrow("Schedule with name 'unknown-schedule' does not exist");
  });

  test('fail when name argument is not specified', () => {
    expect(() => {
      ScheduleParser.parseSchedule();
    }).toThrow("Mandatory parameter 'data' is missing");
  });
});
