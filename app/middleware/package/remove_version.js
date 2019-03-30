
var debug = require('debug')('cnpmjs.org:controllers:registry:package:remove_version');
var logger = require('../../common/logger');
var getCDNKey = require('../../lib/common').getCDNKey;

// DELETE /:name/download/:filename/-rev/:rev
// https://github.com/npm/npm-registry-client/blob/master/lib/unpublish.js#L97
export default async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];
  var filename = ctx.params.filename || ctx.params[1];
  var id = Number(ctx.params.rev || ctx.params[2]);
  // cnpmjs.org-2.0.0.tgz
  var version = filename.split(name + '-')[1];
  if (version) {
    // 2.0.0.tgz
    version = version.substring(0, version.lastIndexOf('.tgz'));
  }
  if (!version) {
    return await next();
  }

  debug('remove tarball with filename: %s, version: %s, revert to => rev id: %s', filename, version, id);

  if (isNaN(id)) {
    return await next();
  }

  var revertTo = await ctx.$service.package.getModuleById(id)
  var mod = await ctx.$service.package.getModule(name, version)// module need to delete

  if (!mod || mod.name !== name) {
    return await next();
  }


  var key = mod.package && mod.package.dist && mod.package.dist.key;
  if (!key) {
    key = getCDNKey(mod.name, filename);
  }

  if (revertTo && revertTo.package) {
    debug('removing key: %s from nfs, revert to %s@%s', key, revertTo.name, revertTo.package.version);
  } else {
    debug('removing key: %s from nfs, no revert mod', key);
  }
  try {
    await ctx.$config.nfs.remove(key);
  } catch (err) {
    logger.error(err);
  }
  // remove version from table
  await ctx.$service.package.removeModulesByNameAndVersions(name, [version]);
  debug('removed %s@%s', name, version);
  ctx.body = { ok: true };
}