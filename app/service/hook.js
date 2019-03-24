const co = require('co');
const logger = require('../common/logger');
export default class {
  async trigger(envelope) {
    if (!this.ctx.$config.globalHook) {
      return;
    }

    envelope.time = Date.now();

    co(async () => {
      await this.ctx.$config.globalHook(envelope);
    }).catch(err => {
      logger.error(err);
    });
  }
}