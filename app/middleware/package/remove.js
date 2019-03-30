var debug = require('debug')('cnpmjs.org:controllers:registry:package:remove');
var urlparse = require('url').parse;
var logger = require('../../common/logger');

// DELETE /:name/-rev/:rev
// https://github.com/npm/npm-registry-client/blob/master/lib/unpublish.js#L25
export default async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];
  var rev = ctx.params.rev || ctx.params[1];
  debug('remove all the module with name: %s, id: %s', name, rev);

  var mods = await ctx.$service.package.listModulesByName(name);
  debug('removeAll module %s: %d', name, mods.length);
  var mod = mods[0];
  if (!mod) {
    return await next();
  }


  await ctx.$service.package.removeModulesByName(name);
  await ctx.$service.package.removeModuleTags(name);
  await ctx.$service.total.plusDeleteModule();


  var keys = [];
  for (var i = 0; i < mods.length; i++) {
    var row = mods[i];
    var dist = row.package.dist;
    var key = dist.key;
    if (!key) {
      key = urlparse(dist.tarball).pathname;
    }
    key && keys.push(key);
  }

  try {
    await keys.map(function (key) {
      return ctx.$config.nfs.remove(key);
    });
  } catch (err) {
    logger.error(err);
  }

  // remove the maintainers
  await ctx.$service.package.removeAllMaintainers(name);

  ctx.body = { ok: true };
};
