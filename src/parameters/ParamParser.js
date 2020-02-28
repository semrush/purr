const fs = require('fs');
const yaml = require('js-yaml');

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

  mergeParams(entityParameters, params = {}) {
    return {
      // Defaults from params file
      ...this.getGlobalDefaults(),
      // Defaults from checks file
      ...entityParameters,
      // Params from envvars
      ...utils.getPrefixedEnvVars(config.envVarParamPrefix),
      // Params. Just params
      ...params,
    };
  }
}

module.exports = ParamParser;
