const fs = require('fs');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks');

const config = require('../config');
const utils = require('../utils');

class ParamParser {
  constructor() {
    this.infoDoc = yaml.safeLoad(
      fs.readFileSync(config.parametersInfoFilePath, 'utf8')
    );
  }

  getGlobalDefaults() {
    const params = {};
    Object.entries(this.infoDoc).forEach(([k, v]) => {
      params[k] = v.default;
    });
    return params;
  }
}

class CheckParser {
  constructor() {
    this.rawContent = fs.readFileSync(config.checksFilePath, 'utf8');
    this.rawDoc = yaml.safeLoad(this.rawContent);
    this.paramParser = new ParamParser();
  }

  getList() {
    return Object.keys(this.rawDoc.checks);
  }

  getScenario(name = utils.mandatory('name'), params = {}) {
    if (typeof this.rawDoc.checks[name] === 'undefined') {
      throw new Error(`Check with name '${name}' does not exist`);
    }

    const scenario = [];
    const mergedParams = {
      // Defaults from params file
      ...this.paramParser.getGlobalDefaults(),
      // Defaults from checks file
      ...this.rawDoc.checks[name].parameters,
      // Params from envvars
      ...utils.getPrefixedEnvVars(config.envVarParamPrefix),
      // Params. Just params
      ...params,
    };

    const preparedDoc = yaml.safeLoad(
      nunjucks.renderString(this.rawContent, mergedParams)
    );
    const check = preparedDoc.checks[name];

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
