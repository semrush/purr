class CheckReport {
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
    labels = []
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
  }
}

class ActionReport {
  constructor(
    name,
    step,
    params,
    success,
    shortMessage,
    fullMessage,
    startDateTime,
    endDateTime
  ) {
    this.name = name;
    this.step = step;
    this.params = params;
    this.success = success;
    this.shortMessage = shortMessage;
    this.fullMessage = fullMessage;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
  }
}

module.exports = {
  CheckReport,
  ActionReport,
};
