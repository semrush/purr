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
  ActionReport,
};
