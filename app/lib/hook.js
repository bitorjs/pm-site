'use strict';

const co = require('co');
const logger = require('../common/logger');

const config = global.context.$config;

exports.trigger = envelope => {
  if (!config.globalHook) {
    return;
  }

  envelope.time = Date.now();

  co(async () => {
    await config.globalHook(envelope);
  }).catch(err => {
    logger.error(err);
  });
};
