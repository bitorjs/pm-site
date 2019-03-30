import os from 'os';
import util from 'util';
import utility from 'utility';
import Logger from 'mini-logger';
import formater from 'error-formater';
import mail from './mail';

const config = global.context.$config;

const debug = require('debug')('cnpmjs.org:logger');

const isTEST = process.env.NODE_ENV === 'test';
const categories = ['sync_info', 'sync_error'];

const logger = module.exports = Logger({
  categories: categories,
  dir: config.logdir,
  duration: '1d',
  format: '[{category}.]YYYY-MM-DD[.log]',
  stdout: config.debug && !isTEST,
  errorFormater: errorFormater,
  seperator: os.EOL,
});

const to = [];
for (var user in config.admins) {
  to.push(config.admins[user]);
}

function errorFormater(err) {
  const msg = formater.both(err);
  mail.error(to, msg.json.name, msg.text);
  return msg.text;
}

logger.syncInfo = function () {
  const args = [].slice.call(arguments);
  if (typeof args[0] === 'string') {
    args[0] = util.format('[%s][%s] ', utility.logDate(), process.pid) + args[0];
  }
  if (debug.enabled) {
    debug.apply(debug, args);
  }
  logger.sync_info.apply(logger, args);
};

logger.syncError = function () {
  const args = [].slice.call(arguments);
  if (typeof args[0] === 'string') {
    args[0] = util.format('[%s][%s] ', utility.logDate(), process.pid) + args[0];
  }
  if (debug.enabled) {
    debug.apply(debug, args);
  }
  logger.sync_error.apply(logger, arguments);
};
