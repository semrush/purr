const { EnvParams } = require('./config/env');
const { Configuration } = require('./config/configuration');

const envParams = new EnvParams();
const config = new Configuration(envParams, __dirname);

module.exports = config;
