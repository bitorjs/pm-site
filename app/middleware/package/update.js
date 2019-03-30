'use strict';

var debug = require('debug')('cnpmjs.org:controllers:registry:package:update');

// PUT /:name/-rev/:rev
//
// * remove with versions, then will `DELETE /:name/download/:filename/-rev/:rev`
// * ...
export default async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];
  debug('update module %s, %s, %j', ctx.url, name, ctx.request.body);

  var body = ctx.request.body;
  if (body.versions) {
    await updateVersions.call(null, ctx, next);
  } else if (body.maintainers) {
    await updateMaintainers.call(null, ctx, next);
  } else {
    await next();
  }
};

// update with versions
// https://github.com/npm/npm-registry-client/blob/master/lib/unpublish.js#L63
const updateVersions = async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];

  // left versions
  var versions = ctx.request.body.versions;

  // step1: list all the versions
  var mods = await ctx.$service.package.listModulesByName(name);
  debug('removeWithVersions module %s, left versions %j, %s mods',
    name, Object.keys(versions), mods && mods.length);
  if (!mods || !mods.length) {
    return await next();
  }

  // step3: calculate which versions need to remove and
  // which versions need to remain
  var removeVersions = [];
  var removeVersionMaps = {};
  var remainVersions = [];

  for (var i = 0; i < mods.length; i++) {
    var v = mods[i].version;
    if (!versions[v]) {
      removeVersions.push(v);
      removeVersionMaps[v] = true;
    } else {
      remainVersions.push(v);
    }
  }

  if (!removeVersions.length) {
    debug('no versions need to remove');
    ctx.status = 201;
    ctx.body = { ok: true };
    return;
  }
  debug('remove versions: %j, remain versions: %j', removeVersions, remainVersions);

  // step 4: remove all the versions which need to remove
  // let removeTar do remove versions from module table
  var tags = await ctx.$service.package.listModuleTags(name);

  var removeTags = [];
  var latestRemoved = false;
  tags.forEach(function (tag) {
    // ctx tag need be removed
    if (removeVersionMaps[tag.version]) {
      removeTags.push(tag.id);
      if (tag.tag === 'latest') {
        latestRemoved = true;
      }
    }
  });

  debug('remove tags: %j', removeTags);
  if (removeTags.length) {
    // step 5: remove all the tags
    await ctx.$service.package.removeModuleTagsByIds(removeTags);
    if (latestRemoved && remainVersions[0]) {
      debug('latest tags removed, generate a new latest tag with new version: %s',
        remainVersions[0]);
      // step 6: insert new latest tag
      await ctx.$service.package.addModuleTag(name, 'latest', remainVersions[0]);
    }
  }

  // step 7: update last modified, make sure etag change
  await ctx.$service.package.updateModuleLastModified(name);

  ctx.status = 201;
  ctx.body = { ok: true };
}

const updateMaintainers = async (ctx) => {
  console.log('updateMaintainers', ctx.params)
  var name = ctx.params.name || ctx.params[0];
  console.log('updateMaintainers', name)
  var body = ctx.request.body;
  debug('updateMaintainers module %s, %j', name, body);

  var usernames = body.maintainers.map(function (user) {
    return user.name;
  });

  if (usernames.length === 0) {
    ctx.status = 403;
    const error = '[invalid_operation] Can not remove all maintainers';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  if (ctx.$config.customUserService) {
    // ensure new authors are vaild
    var maintainers = await ctx.$service.package.listMaintainerNamesOnly(name);
    var map = {};
    var newNames = [];
    for (var i = 0; i < maintainers.length; i++) {
      map[maintainers[i]] = 1;
    }
    for (var i = 0; i < usernames.length; i++) {
      var username = usernames[i];
      if (map[username] !== 1) {
        newNames.push(username);
      }
    }
    if (newNames.length > 0) {
      var users = await ctx.$service.User.list(newNames);
      var map = {};
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        map[user.login] = 1;
      }
      var invailds = [];
      for (var i = 0; i < newNames.length; i++) {
        var username = newNames[i];
        if (map[username] !== 1) {
          invailds.push(username);
        }
      }
      if (invailds.length > 0) {
        ctx.status = 403;
        const error = '[invalid] User: `' + invailds.join(', ') + '` not exists';
        ctx.body = {
          error,
          reason: error,
        };
        return;
      }
    }
  }

  var r = await ctx.$service.package.updatePrivateModuleMaintainers(name, usernames);
  debug('result: %j', r);

  ctx.status = 201;
  ctx.body = {
    ok: true,
    id: name,
    rev: ctx.params.rev || ctx.params[1],
  };
}
