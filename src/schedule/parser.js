const fs = require('fs');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks');

const utils = require('../utils');
const ParamParser = require('../parameters/ParamParser');

class ScheduleParser {
  constructor(dataFilePath) {
    this.rawContent = fs.readFileSync(dataFilePath, 'utf8');
    this.rawDoc = yaml.load(this.rawContent);
    this.paramParser = new ParamParser();
    this.preparedDoc = null;
  }

  getList() {
    return Object.keys(this.rawDoc.schedules);
  }

  getSchedule(name = utils.mandatory('name'), params = {}) {
    if (typeof this.rawDoc.schedules[name] === 'undefined') {
      throw new Error(`Schedule with name '${name}' does not exist`);
    }

    const mergedParams = this.paramParser.mergeParams(
      this.rawDoc.schedules[name].parameters,
      params
    );

    const parsedDoc = yaml.load(
      nunjucks.renderString(this.rawContent, mergedParams)
    );
    return ScheduleParser.parseSchedule(parsedDoc.schedules[name]);
  }

  static parseSchedule(data = utils.mandatory('data')) {
    const preparedData = data;

    if (!preparedData.interval) {
      throw new Error(
        `Schedule should have interval in format "60(s|m)". Now: ` +
          `${preparedData.interval}`
      );
    }

    preparedData.interval = utils.humanReadableTimeToMS(preparedData.interval);

    if (preparedData.allowedCookies === undefined) {
      preparedData.allowedCookies = [];
    }

    if (preparedData.labels === undefined) {
      preparedData.labels = [];
    }

    if (typeof preparedData.labels !== 'object') {
      throw new Error(
        `Schedule labels should be object, not ${typeof preparedData.labels}`
      );
    }

    const allowedLabels = [
      'team',
      'product',
      'priority',
      'appName',
      'appLink',
      'slackChannel',
    ];
    const notAllowedLabels = Object.keys(preparedData.labels).filter(
      (labelName) => !allowedLabels.includes(labelName)
    );

    const allowedPriorities = ['p1', 'p2', 'p3', 'p4', 'p5'];
    if (
      preparedData.labels.priority &&
      !allowedPriorities.includes(preparedData.labels.priority)
    ) {
      throw new Error(
        `This value is not allowed for label priority` +
          `"${preparedData.labels.priority}"`
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
