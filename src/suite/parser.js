const fs = require('fs');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks');

const utils = require('../utils');
const ParamParser = require('../parameters/ParamParser');

class SuiteParser {
  constructor(dataFilePath) {
    this.rawContent = fs.readFileSync(dataFilePath, 'utf8');
    this.rawDoc = yaml.safeLoad(this.rawContent);
    this.paramParser = new ParamParser();
    this.preparedDoc = null;
  }

  getList() {
    return Object.keys(this.rawDoc.suites);
  }

  getSuite(name = utils.mandatory('name'), params = {}) {
    if (typeof this.rawDoc.suites[name] === 'undefined') {
      throw new Error(`Suite with name '${name}' does not exist`);
    }

    const mergedParams = this.paramParser.mergeParams(
      this.rawDoc.suites[name].parameters,
      params
    );

    const parsedDoc = yaml.safeLoad(
      nunjucks.renderString(this.rawContent, mergedParams)
    );
    return parsedDoc.suites[name];
  }

  getSuiteSteps(name = utils.mandatory('name')) {
    const suite = this.getSuite(name);
    if (typeof suite.steps === 'undefined') {
      throw new Error(`Suite with name '${name}' has no steps`);
    }
    return suite.steps;
  }

  getSuiteProxy(name = utils.mandatory('name'), params = {}) {
    const suite = this.getSuite(name, params);
    if (typeof suite.proxy === 'undefined') {
      return null;
    }
    return suite.proxy;
  }
}

module.exports = {
  SuiteParser,
};
