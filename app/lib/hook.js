'use strict';

const co = require('co');
const config = require('../../config/app.config');
const logger = require('../common/logger');

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
