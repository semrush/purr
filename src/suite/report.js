class SuiteReport {
  constructor(
    name,
    id,
    success,
    shortMessage,
    fullMessage,
    startDateTime,
    endDateTime,
    checks = []
  ) {
    this.name = name;
    this.id = id;
    this.success = success;
    this.shortMessage = shortMessage;
    this.fullMessage = fullMessage;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
    this.checks = checks;
  }
}

module.exports = {
  SuiteReport,
};
