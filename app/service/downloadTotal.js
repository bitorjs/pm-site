var utility = require('utility');
import models from '../models'
var DownloadTotal = models.DownloadTotal;

export default class {

  async getModuleTotal(name, start, end) {
    var startMonth = parseYearMonth(start);
    var endMonth = parseYearMonth(end);
    var rows = await DownloadTotal.findAll({
      where: {
        date: {
          gte: startMonth,
          lte: endMonth
        },
        name: name
      }
    });
    return formatRows(rows, start, end);
  }

  async getTotalByName(name) {
    var rows = await DownloadTotal.findAll({
      where: {
        name: name
      }
    });
    var count = 0;
    rows.forEach(function (row) {
      for (var i = 1; i <= 31; i++) {
        var day = i < 10 ? '0' + i : String(i);
        var field = 'd' + day;
        var val = row[field];
        if (typeof val === 'string') {
          val = utility.toSafeNumber(val);
        }
        count += val;
      }
    });
    return count;
  }

  async plusModuleTotal(data) {
    var yearMonth = parseYearMonth(data.date);
    var row = await DownloadTotal.findOne({
      where: {
        name: data.name,
        date: yearMonth,
      }
    });
    if (!row) {
      row = DownloadTotal.build({
        name: data.name,
        date: yearMonth,
      });
      await row.save();
    }
    var field = 'd' + data.date.substring(8, 10);
    if (this.ctx.$config.database.dialect === 'mysql') {
      // mysql update set field = field + count
      await models.query(`UPDATE downloads SET ${field} = ${field} + ${data.count}, gmt_modified=? WHERE id = ?`,
        [new Date(), row.id]);
    } else {
      // pg
      if (typeof row[field] === 'string') {
        // pg bigint is string...
        row[field] = utility.toSafeNumber(row[field]);
      }
      row[field] += data.count;
      if (row.changed()) {
        return await row.save();
      }
    }

    return row;
  }

  async getTotal(start, end) {
    return await this.getModuleTotal('__all__', start, end);
  }

}


function parseYearMonth(date) {
  return Number(date.substring(0, 7).replace('-', ''));
}

function formatRows(rows, startDate, endDate) {
  var dates = [];
  rows.forEach(function (row) {
    var date = String(row.date);
    var month = date.substring(4, 6);
    var year = date.substring(0, 4);
    var yearMonth = year + '-' + month;
    for (var i = 1; i <= 31; i++) {
      var day = i < 10 ? '0' + i : String(i);
      var field = 'd' + day;
      var d = yearMonth + '-' + day;
      var count = row[field];
      if (typeof count === 'string') {
        count = utility.toSafeNumber(count);
      }
      if (count > 0 && d >= startDate && d <= endDate) {
        dates.push({
          name: row.name,
          count: count,
          date: d
        });
      }
    }
  });
  return dates;
}

