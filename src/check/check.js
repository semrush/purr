const utils = require('../utils');

class CheckData {
  constructor(
    name = utils.mandatory('name'),
    id = utils.mandatory('id'),
    params = {},
    scheduleName = '',
    labels = []
  ) {
    this.name = name;
    this.id = id;
    this.params = params;
    this.scheduleName = scheduleName;
    this.labels = labels;
  }
}

module.exports = {
  CheckData,
};
