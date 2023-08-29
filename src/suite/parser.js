const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks');

const utils = require('../utils');
const ParamParser = require('../parameters/ParamParser');

/**
 * @typedef Suite
 * @property {string[]} steps
 * @property {string} proxy
 */

class SuiteParser {
  /**
   * @param {string} suitesDir
   */
  constructor(suitesDir) {
    const rawContent = [];

    const dir = fs.opendirSync(suitesDir);
    let dirent = dir.readSync();

    while (dirent !== null) {
      if (dirent.isFile()) {
        const file = fs.readFileSync(path.resolve(suitesDir, dirent.name));

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
  }

  getList() {
    return Object.keys(this.rawDoc);
  }

  /**
   *
   * @param {string} name Suite name
   * @param {object} params
   * @returns {Suite}
   */
  getSuite(
    // @ts-ignore
    name = utils.mandatory('name'),
    params = {}
  ) {
    if (typeof this.rawDoc[name] === 'undefined') {
      throw new Error(`Suite with name '${name}' does not exist`);
    }

    if (this.rawDoc[name] === null) {
      throw new Error(`Suite with name '${name}' is empty`);
    }

    const mergedParams = this.paramParser.mergeParams(
      this.rawDoc[name].parameters,
      params
    );

    const parsedDoc = yaml.load(
      nunjucks.renderString(this.rawContent, mergedParams)
    );
    return parsedDoc[name];
  }

  /**
   *
   * @param {string} name Suite name
   * @returns {string[]}
   */
  getSuiteSteps(
    // @ts-ignore
    name = utils.mandatory('name')
  ) {
    const suite = this.getSuite(name);
    if (!suite.steps) {
      throw new Error(`Suite with name '${name}' has no steps`);
    }
    return suite.steps;
  }

  /**
   *
   * @param {string} name Suite name
   * @param {object} params
   * @returns
   */
  getSuiteProxy(
    // @ts-ignore
    name = utils.mandatory('name'),
    params = {}
  ) {
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
