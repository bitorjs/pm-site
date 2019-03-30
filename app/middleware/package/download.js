'use strict';

var debug = require('debug')('cnpmjs.org:controllers:registry:download');
var mime = require('mime');
var utility = require('utility');
var defer = require('co-defer');
var is = require('is-type-of');

var logger = require('../../common/logger');
var common = require('../../lib/common');
var downloadAsReadStream = require('../../lib/utils').downloadAsReadStream;

let globalDownloads = new Map();

export default async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];
  var filename = ctx.params.filename || ctx.params[1];
  var version = filename.slice(name.length + 1, -4);
  var row = await ctx.$service.package.getModule(name, version);
  // can not get dist
  var url = null;
  var query = ctx.query || {};
  // allow download from specific store bucket
  var options = query.bucket ? { bucket: query.bucket } : null;

  if (typeof ctx.$config.nfs.url === 'function') {
    if (is.generatorFunction(ctx.$config.nfs.url)) {
      url = await ctx.$config.nfs.url(common.getCDNKey(name, filename), options);
    } else {
      url = ctx.$config.nfs.url(common.getCDNKey(name, filename), options);
    }
  }

  debug('download %s %s %s %s', name, filename, version, url);

  if (!row || !row.package || !row.package.dist) {
    if (!url) {
      return await next;
    }
    ctx.status = 302;
    ctx.set('Location', url);
    const count = (globalDownloads.get(name) || 0) + 1;
    globalDownloads.set(name, count);
    return;
  }



  const count = (globalDownloads.get(name) || 0) + 1;
  globalDownloads.set(name, count);

  if (ctx.$config.downloadRedirectToNFS && url) {
    ctx.status = 302;
    ctx.set('Location', url);
    return;
  }

  var dist = row.package.dist;
  if (!dist.key) {
    // try to use nsf.url() first
    url = url || dist.tarball;
    debug('get tarball by 302, url: %s', url);
    ctx.status = 302;
    ctx.set('Location', url);
    return;
  }

  // else use `dist.key` to get tarball from nfs
  if (typeof dist.size === 'number' && dist.size > 0) {
    ctx.length = dist.size;
  }
  ctx.type = mime.lookup(dist.key);
  ctx.attachment(filename);
  ctx.etag = dist.shasum;
  const res = await downloadAsReadStream(dist.key)
  ctx.body = res;
};
var saving = false;


defer.setInterval(async () => {
  const ctx = global.context;
  if (saving) {
    return;
  }

  // save download count
  var totals = [];
  var allCount = 0;
  for (const [name, count] of globalDownloads) {
    if (name !== '__all__') {
      totals.push([name, count]);
    }
    allCount += count;
  }
  globalDownloads = new Map();

  if (allCount === 0) {
    return;
  }

  saving = true;
  totals.push(['__all__', allCount]);
  debug('save download total: %j', totals);

  var date = utility.YYYYMMDD();
  for (var i = 0; i < totals.length; i++) {
    var item = totals[i];
    var name = item[0];
    var count = item[1];
    try {
      await ctx.$service.downloadTotal.plusModuleTotal({ name: name, date: date, count: count });
    } catch (err) {
      if (err.name !== 'SequelizeUniqueConstraintError') {
        err.message += '; name: ' + name + ', count: ' + count + ', date: ' + date;
        logger.error(err);
      }
      // save back to globalDownloads, try again next time
      count = (globalDownloads.get(name) || 0) + count;
      globalDownloads.set(name, count);
    }
  }
  saving = false;
}, 5000 + Math.ceil(Math.random() * 1000));

