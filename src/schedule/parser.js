const fs = require('fs');
const yaml = require('js-yaml');

const utils = require('../utils');

class ScheduleParser {
  constructor(dataFilePath) {
    this.doc = yaml.safeLoad(fs.readFileSync(dataFilePath, 'utf8'));
  }

  getList() {
    return Object.keys(this.doc.schedules);
  }

  getSchedule(name = utils.mandatory('name')) {
    if (typeof this.doc.schedules[name] === 'undefined') {
      throw new Error(`Schedule with name '${name}' does not exist`);
    }
    return ScheduleParser.parseSchedule(this.doc.schedules[name]);
  }

  static parseSchedule(data = utils.mandatory('data')) {
    const preparedData = data;

    preparedData.interval = utils.humanReadableTimeToMS(preparedData.interval);

    if (preparedData.labels === undefined) {
      preparedData.labels = [];
    }

    if (typeof preparedData.labels !== 'object') {
      throw new Error(
        `Schedule labels should be object, not ${typeof preparedData.labels}`
      );
    }

    const allowedLabels = ['team', 'product', 'priority'];
    const notAllowedLabels = Object.keys(preparedData.labels).filter(
      (labelName) => !allowedLabels.includes(labelName)
    );

    const allowedPriorities = ['p1', 'p2', 'p3', 'p4', 'p5'];
    if (
      preparedData.labels.priority &&
      !allowedPriorities.includes(preparedData.labels.priority)
    ) {
      throw new Error(
        `This schedule priority is not allowed "${
          preparedData.labels.priority
        }"`
      );
    }

    if (notAllowedLabels.length > 0) {
      throw new Error(
        `Next schedule labels are not allowed "${notAllowedLabels}"`
      );
    }

    return data;
  }
}

module.exports = {
  ScheduleParser,
};
