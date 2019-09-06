const fs = require('fs');
const yaml = require('js-yaml');

const utils = require('../utils');

class SuiteParser {
  constructor(dataFilePath) {
    this.doc = yaml.safeLoad(fs.readFileSync(dataFilePath, 'utf8'));
  }

  getList() {
    return Object.keys(this.doc.suites);
  }

  getSuite(name = utils.mandatory('name')) {
    if (typeof this.doc.suites[name] === 'undefined') {
      throw new Error(`Suite with name '${name}' does not exist`);
    }
    return SuiteParser.parseSuite(this.doc.suites[name]);
  }

  static parseSuite(data = utils.mandatory('data')) {
    return data.steps;
  }
}

module.exports = {
  SuiteParser,
};
