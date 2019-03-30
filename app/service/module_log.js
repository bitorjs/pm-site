import models from '../models';
var ModuleLog = models.ModuleLog;

// 50kb
var MAX_LEN = 50 * 1024;

export default class {

  async create(data) {
    var row = ModuleLog.build({
      name: data.name,
      username: data.username || 'anonymous',
      log: ''
    });
    return await row.save();
  }


  async append(id, log) {
    if (!log) {
      return null;
    }

    var row = await this.get(id);
    if (!row) {
      return null;
    }

    if (row.log) {
      row.log += '\n' + log;
    } else {
      row.log = log;
    }
    if (row.log.length > MAX_LEN) {
      // only keep the fisrt 1kb and the last 50kb log string
      row.log = row.log.substring(0, 1024) + '\n... ignore long logs ...\n' + row.log.substring(row.log.length - MAX_LEN);
    }
    return await row.save(['log']);
  }

  async get(id) {
    return await ModuleLog.findOne({ where: { id: id } });
  }

}
