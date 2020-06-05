class CheckReport {
  /**
   * Create a check report.
   * @param {string} name - Check name
   * @param {string} id - Check id
   * @param {boolean} [success] - Success status
   * @param {string} [shortMessage] - Short message
   * @param {string} [fullMessage] - Full message
   * @param {string} [tracePath] - Trace path
   * @param {string} [screenshotPath] - Screenshot path
   * @param {string} [consoleLogPath] - Console log path
   * @param {string} [startDateTime] - Check start datetime
   * @param {string} [endDateTime] - Check completion datetime
   * @param {ActionReport[]} [actions=[]] - Check action list
   * @param {string} [scheduleName=''] - Schedule name
   * @param {string[]} [labels=[]] - Labels
   * @param {string[]} [forbiddenCookies=[]] - Found forbidden cookies
   * @param {number} [forbiddenCookiesCount=0] - Count of forbidden cookies found
   */
  constructor(
    name,
    id,
    success,
    shortMessage,
    fullMessage,
    tracePath,
    screenshotPath,
    consoleLogPath,
    startDateTime,
    endDateTime,
    actions = [],
    scheduleName = '',
    labels = [],
    forbiddenCookies = [],
    forbiddenCookiesCount = 0
  ) {
    this.name = name;
    this.id = id;
    this.success = success;
    this.shortMessage = shortMessage;
    this.fullMessage = fullMessage;
    this.tracePath = tracePath;
    this.screenshotPath = screenshotPath;
    this.consoleLogPath = consoleLogPath;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
    this.actions = actions;
    this.scheduleName = scheduleName;
    this.labels = labels;
    this.forbiddenCookies = forbiddenCookies;
    this.forbiddenCookiesCount = forbiddenCookiesCount;
  }
}

class ActionReport {
  /**
   * Create a check action report.
   * @param {string} name - Action name
   * @param {number} step - Action step number
   * @param {object} params - Action parameters
   * @param {boolean} [success] - Success status
   * @param {string} [shortMessage] - Short message
   * @param {string} [fullMessage] - Full message
   * @param {string} [startDateTime] - Check start datetime
   * @param {string} [endDateTime] - Check completion datetime
   * @param {object[]} [cookies=[]] - Check completion datetime
   */
  constructor(
    name,
    step,
    params,
    success,
    shortMessage,
    fullMessage,
    startDateTime,
    endDateTime,
    cookies = []
  ) {
    this.name = name;
    this.step = step;
    this.params = params;
    this.success = success;
    this.shortMessage = shortMessage;
    this.fullMessage = fullMessage;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
    this.cookies = cookies;
  }
}

module.exports = {
  CheckReport,
  ActionReport,
};
