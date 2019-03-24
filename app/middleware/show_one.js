var debug = require('debug')('cnpmjs.org:controllers:registry:package:show');
var semver = require('semver');

var setDownloadURL = require('../lib/common').setDownloadURL;
var SyncModuleWorker = require('../lib/sync_module_worker');

export default async (ctx, next) => {
  console.log('show one', ctx.params)
  var name = ctx.params.name || ctx.params[0];
  var tag = ctx.params.version || ctx.params[1];
  if (tag === '*') {
    tag = 'latest';
  }
  var version = semver.valid(tag);
  var range = semver.validRange(tag);
  var mod;
  if (version) {
    mod = await ctx.$service.package.getModule(name, version);
  } else if (range) {
    mod = await ctx.$service.package.getModuleByRange(name, range);
  } else {
    mod = await ctx.$service.package.getModuleByTag(name, tag);
  }

  if (mod) {
    setDownloadURL(mod.package, ctx);
    mod.package._cnpm_publish_time = mod.publish_time;
    mod.package.publish_time = mod.package.publish_time || mod.publish_time;
    var rs = await [
      ctx.$service.package.listMaintainers(name),
      ctx.$service.package.listModuleTags(name),
    ];
    var maintainers = rs[0];
    if (maintainers.length > 0) {
      mod.package.maintainers = maintainers;
    }
    var tags = rs[1];
    var distTags = {};
    for (var i = 0; i < tags.length; i++) {
      var t = tags[i];
      distTags[t.tag] = t.version;
    }
    // show tags for npminstall faster download
    mod.package['dist-tags'] = distTags;
    ctx.jsonp = mod.package;
    return;
  }

  // if not fond, sync from source registry
  if (!ctx.allowSync) {
    ctx.status = 404;
    const error = '[not_exists] version not found: ' + version;
    ctx.jsonp = {
      error,
      reason: error,
    };
    return;
  }

  // start sync
  var logId = await SyncModuleWorker.sync(name, 'sync-by-install');
  debug('start sync %s, get log id %s', name, logId);

  ctx.redirect(ctx.$config.officialNpmRegistry + ctx.url);
}