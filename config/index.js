const appConfig = require('./app.config');
const devConfig = require('./development.config');
const prodConfig = require('./production.config');

module.exports = {
  ...appConfig,
  ...devConfig,
}