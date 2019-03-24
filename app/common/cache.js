
const debug = require('debug')('cnpmjs.org:cache');
// const Redis = require('ioredis');
import config from '../../config/app.config'

let client = {};

if (config.redisCache.enable) {
  client = new Redis(config.redisCache.connectOptions);
  client.on('ready', () => {
    debug('connect ready, getBuiltinCommands: %j', client.getBuiltinCommands());
  });
}

module.exports = client;
