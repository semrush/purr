const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks');

const config = require('../config');
const utils = require('../utils');
const ParamParser = require('../parameters/ParamParser');

class CheckParser {
  constructor() {
    const rawContent = [];

    const dir = fs.opendirSync(config.checksDir);
    let dirent = dir.readSync();

    while (dirent !== null) {
      if (dirent.isFile()) {
        const file = fs.readFileSync(
          path.resolve(config.checksDir, dirent.name)
        );

        if (dirent.name.startsWith('.common.')) {
          rawContent.unshift(file);
        } else {
          rawContent.push(file);
        }
      }
      dirent = dir.readSync();
    }

    dir.close();

    this.rawContent = rawContent.join('\n');
    this.rawDoc = yaml.load(this.rawContent);
    this.paramParser = new ParamParser();
    this.preparedDoc = null;
  }

  getList() {
    return Object.keys(this.rawDoc);
  }

  getParsedCheck(name = utils.mandatory('name')) {
    if (typeof this.preparedDoc[name] === 'undefined') {
      throw new Error(`Check with name '${name}' was not parsed`);
    }
    return this.preparedDoc[name];
  }

  getScenario(name = utils.mandatory('name'), params = {}) {
    if (typeof this.rawDoc[name] === 'undefined') {
      throw new Error(`Check with name '${name}' does not exist`);
    }

    const scenario = [];

    const mergedParams = this.paramParser.mergeParams(
      this.rawDoc[name].parameters,
      params
    );

    this.preparedDoc = yaml.load(
      nunjucks.renderString(this.rawContent, mergedParams)
    );
    const check = this.preparedDoc[name];

    const flattenedSteps = utils.flattenArray(check.steps, true);

    flattenedSteps.forEach((x, i) => {
      if (typeof x !== 'object') {
        throw new Error(
          `Step with index ${i} should be 'object', not '${typeof x}'.`
        );
      }

      Object.entries(x).forEach((action) => {
        scenario.push(action);
      });
    });

    return scenario;
  }
}

module.exports = {
  CheckParser,
  ParamParser,
};
