var debug = require('debug')('cnpmjs.org:controllers:registry:package:save');
var crypto = require('crypto');
var deprecateVersions = require('./deprecate');
var common = require('../lib/common');

const addDepsRelations = async (pkg, ctx) => {
  var dependencies = Object.keys(pkg.dependencies || {});
  if (dependencies.length > ctx.$config.maxDependencies) {
    dependencies = dependencies.slice(0, ctx.$config.maxDependencies);
  }
  await ctx.$service.package.addDependencies(pkg.name, dependencies);
}

const test = async () => {
  return {};
}

export default async (ctx, next) => {
  var pkg = ctx.request.body;
  var username = ctx.user.name;
  // var name = ctx.params.name;
  var name = pkg.name;
  // var name = ctx.url.replace('/', '')
  var filename = Object.keys(pkg._attachments || {})[0];
  var version = Object.keys(pkg.versions || {})[0];
  if (!version) {
    ctx.status = 400;
    const error = '[version_error] package.versions is empty';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }


  // check maintainers
  var result = await ctx.$service.package.authMaintainer(name, username);
  if (!result.isMaintainer) {
    ctx.status = 403;
    const error = '[forbidden] ' + username + ' not authorized to modify ' + name +
      ', please contact maintainers: ' + result.maintainers.join(', ');
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }



  if (!filename) {
    var hasDeprecated = false;
    for (var v in pkg.versions) {
      var row = pkg.versions[v];
      if (typeof row.deprecated === 'string') {
        hasDeprecated = true;
        break;
      }
    }
    if (hasDeprecated) {
      return await deprecateVersions.call(ctx, next);
    }

    ctx.status = 400;
    const error = '[attachment_error] package._attachments is empty';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  var attachment = pkg._attachments[filename];
  var versionPackage = pkg.versions[version];
  var maintainers = versionPackage.maintainers;

  // should never happened in normal request
  if (!maintainers) {
    ctx.status = 400;
    const error = '[maintainers_error] request body need maintainers';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  // notice that admins can not publish to all modules
  // (but admins can add self to maintainers first)

  // make sure user in auth is in maintainers
  // should never happened in normal request
  var m = maintainers.filter(function (maintainer) {
    return maintainer.name === username;
  });
  if (m.length === 0) {
    ctx.status = 403;
    const error = '[maintainers_error] ' + username + ' does not in maintainer list';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }


  // TODO: add ctx info into some table
  versionPackage._publish_on_cnpm = true;
  var distTags = pkg['dist-tags'] || {};
  var tags = []; // tag, version
  for (var t in distTags) {
    tags.push([t, distTags[t]]);
  }

  if (tags.length === 0) {
    ctx.status = 400;
    const error = '[invalid] dist-tags should not be empty';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }



  debug('%s publish new %s:%s, attachment size: %s, maintainers: %j, distTags: %j',
    username, name, version, attachment.length, versionPackage.maintainers, distTags);
  var exists = await ctx.$service.package.getModule(name, version);
  var shasum;
  if (exists) {
    ctx.status = 403;
    const error = '[forbidden] cannot modify pre-existing version: ' + version;
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }
  // upload attachment
  var tarballBuffer;
  tarballBuffer = Buffer.from(attachment.data, 'base64');

  if (tarballBuffer.length !== attachment.length) {
    ctx.status = 403;
    const error = '[size_wrong] Attachment size ' + attachment.length
      + ' not match download size ' + tarballBuffer.length;
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  if (!distTags.latest) {
    // need to check if latest tag exists or not
    var latest = await ctx.$service.package.getModuleByTag(name, 'latest');
    if (!latest) {
      // auto add latest
      tags.push(['latest', tags[0][1]]);
      debug('auto add latest tag: %j', tags);
    }
  }

  shasum = crypto.createHash('sha1');
  shasum.update(tarballBuffer);
  shasum = shasum.digest('hex');

  var options = {
    key: common.getCDNKey(name, filename),
    shasum: shasum
  };
  var uploadResult = await ctx.$config.nfs.uploadBuffer(tarballBuffer, options);
  console.log('upload %j', uploadResult, options, name, filename)
  debug('upload %j', uploadResult);

  var dist = {
    shasum: shasum,
    size: attachment.length
  };

  // if nfs upload return a key, record it
  if (uploadResult.url) {
    dist.tarball = uploadResult.url;
  } else if (uploadResult.key) {
    dist.key = uploadResult.key;
    dist.tarball = uploadResult.key;
  }


  var mod = {
    name: name,
    version: version,
    author: username,
    package: versionPackage
  };

  mod.package.dist = dist;
  await addDepsRelations(mod.package, ctx);

  var addResult = await ctx.$service.package.saveModule(mod);
  debug('%s module: save file to %s, size: %d, sha1: %s, dist: %j, version: %s',
    addResult.id, dist.tarball, dist.size, shasum, dist, version);

  if (tags.length) {
    await tags.map(function (tag) {
      // tag: [tagName, version]
      return ctx.$service.package.addModuleTag(name, tag[0], tag[1]);
    });
  }

  // ensure maintainers exists
  var maintainerNames = maintainers.map(function (item) {
    return item.name;
  });
  await ctx.$service.package.addPrivateModuleMaintainers(name, maintainerNames);
  ctx.status = 201;
  ctx.body = {
    ok: true,
    rev: String(addResult.id)
  };

  // hooks
  const envelope = {
    event: 'package:publish',
    name: mod.name,
    type: 'package',
    version: mod.version,
    hookOwner: null,
    payload: null,
    change: null,
  };
  ctx.$service.hook.trigger(envelope);
  await next()
};


