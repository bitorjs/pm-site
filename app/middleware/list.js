var debug = require('debug')('cnpmjs.org:controllers:registry:package:list');
var utility = require('utility');

var SyncModuleWorker = require('../lib/sync_module_worker');

var common = require('../lib/common');
const cache = require('../common/cache');
const logger = require('../common/logger');

function etag(objs) {
  return 'W/"' + utility.md5(JSON.stringify(objs)) + '"';
}

export default async (ctx, next) => {
  // const name = ctx.params.name || ctx.params[0];


  var scope = ctx.params.scope;
  var name = ctx.params.name;
  var pkName = scope ? `@${scope}/${name}` : name;
  // sync request will contain ctx query params
  let noCache = ctx.query.cache === '0';
  if (!noCache) {
    const ua = ctx.headers['user-agent'] || '';
    // old sync client will request with these user-agent
    if (ua.indexOf('npm_service.cnpmjs.org/') !== -1) {
      noCache = true;
    }
  }


  const isJSONPRequest = ctx.query.callback;
  let cacheKey;
  let needAbbreviatedMeta = false;
  let abbreviatedMetaType = 'application/vnd.npm.install-v1+json';
  if (ctx.$config.enableAbbreviatedMetadata && ctx.accepts(['json', abbreviatedMetaType]) === abbreviatedMetaType) {
    needAbbreviatedMeta = true;
    if (cache && !isJSONPRequest) {
      cacheKey = `list-${pkName}-v1`;
    }
  }

  if (cacheKey && !noCache) {
    const values = await cache.hmget(cacheKey, 'etag', 'body');
    if (values && values[0] && values[1]) {
      ctx.body = values[1];
      ctx.type = 'json';
      ctx.etag = values[0];
      ctx.set('x-hit-cache', cacheKey);
      debug('hmget %s success, etag:%j', cacheKey, values[0]);
      return;
    }
    debug('hmget %s missing, %j', cacheKey, values);
  }

  var modifiedTime = await ctx.$service.package.getModuleLastModified(pkName);
  var tags = await ctx.$service.package.listModuleTags(pkName);

  debug('show %s, last modified: %s, tags: %j', pkName, modifiedTime, tags);
  if (modifiedTime) {
    // find out the latest modfied time
    // because update tags only modfied tag, wont change module gmt_modified
    for (var i = 0; i < tags.length; i++) {
      var tag = tags[i];
      if (tag.gmt_modified > modifiedTime) {
        modifiedTime = tag.gmt_modified;
      }
    }

    // must set status first
    ctx.status = 200;
    if (ctx.fresh) {
      debug('%s not change at %s, 304 return', pkName, modifiedTime);
      ctx.status = 304;
      return;
    }
  }

  if (needAbbreviatedMeta) {
    var rows = await ctx.$service.package.listModuleAbbreviatedsByName(pkName);
    if (rows.length > 0) {
      await handleAbbreviatedMetaRequest(ctx, pkName, modifiedTime, tags, rows, cacheKey);
      return;
    }
    var fullRows = await ctx.$service.package.listModulesByName(pkName);
    if (fullRows.length > 0) {
      // no abbreviated meta rows, use the full meta convert to abbreviated meta
      await handleAbbreviatedMetaRequestWithFullMeta(ctx, pkName, modifiedTime, tags, fullRows);
      return;
    }
  }

  var rows = await ctx.$service.package.listModulesByName(pkName);
  var starUsers = await ctx.$service.package.listStarUserNames(pkName);
  var maintainers = await ctx.$service.package.listMaintainers(pkName);

  debug('show %s got %d rows, %d tags, %d star users, maintainers: %j',
    pkName, rows.length, tags.length, starUsers.length, maintainers);

  var starUserMap = {};
  for (var i = 0; i < starUsers.length; i++) {
    var starUser = starUsers[i];
    if (starUser[0] !== '"' && starUser[0] !== "'") {
      starUserMap[starUser] = true;
    }
  }
  starUsers = starUserMap;

  if (rows.length === 0) {
    // check if unpublished
    var unpublishedInfo = await ctx.$service.package.getUnpublishedModule(pkName);
    debug('show unpublished %j', unpublishedInfo);
    if (unpublishedInfo) {
      ctx.status = 404;
      // ctx.jsonp = {
      ctx.body = {
        _id: pkName,
        name: pkName,
        time: {
          modified: unpublishedInfo.package.time,
          unpublished: unpublishedInfo.package,
        },
        _attachments: {},
      };
      return;
    }
  }

  // if module not exist in ctx registry,
  // sync the module backend and return package info from official registry
  if (rows.length === 0) {
    if (!ctx.allowSync) {
      ctx.status = 404;
      const error = '[not_found] document not found';
      // ctx.jsonp = {
      ctx.body = {
        error,
        reason: error,
      };
      return;
    }

    // start sync
    var logId = await SyncModuleWorker.sync(pkName, 'sync-by-install');
    debug('start sync %s, get log id %s', pkName, logId);

    return ctx.redirect(ctx.$config.officialNpmRegistry + ctx.url);
  }

  var latestMod = null;
  var readme = null;
  // set tags
  var distTags = {};
  for (var i = 0; i < tags.length; i++) {
    var t = tags[i];
    distTags[t.tag] = t.version;
  }

  // set versions and times
  var versions = {};
  var allVersionString = '';
  var times = {};
  var attachments = {};
  var createdTime = null;
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var pkg = row.package;
    // pkg is string ... ignore it
    if (typeof pkg === 'string') {
      continue;
    }

    common.setDownloadURL(pkg, ctx);
    pkg._cnpm_publish_time = row.publish_time;
    pkg.publish_time = pkg.publish_time || row.publish_time;

    versions[pkg.version] = pkg;
    allVersionString += pkg.version + ',';

    var t = times[pkg.version] = row.publish_time ? new Date(row.publish_time) : row.gmt_modified;
    if ((!distTags.latest && !latestMod) || distTags.latest === pkg.version) {
      latestMod = row;
      readme = pkg.readme;
    }

    delete pkg.readme;
    if (maintainers.length > 0) {
      pkg.maintainers = maintainers;
    }

    if (!createdTime || t < createdTime) {
      createdTime = t;
    }
  }

  if (modifiedTime && createdTime) {
    var ts = {
      modified: modifiedTime,
      created: createdTime,
    };
    for (var t in times) {
      ts[t] = times[t];
    }
    times = ts;
  }

  if (!latestMod) {
    latestMod = rows[0];
  }

  var rev = String(latestMod.id);
  var pkg = latestMod.package;

  if (tags.length === 0) {
    // some sync error reason, will cause tags missing
    // set latest tag at least
    distTags.latest = pkg.version;
  }

  if (!readme && ctx.$config.enableAbbreviatedMetadata) {
    var packageReadme = await ctx.$service.package.getPackageReadme(pkName);
    if (packageReadme) {
      readme = packageReadme.readme;
    }
  }

  var info = {
    _id: pkName,
    _rev: rev,
    name: pkName,
    description: pkg.description,
    'dist-tags': distTags,
    maintainers: pkg.maintainers,
    time: times,
    users: starUsers,
    author: pkg.author,
    repository: pkg.repository,
    versions: versions,
    readme: readme,
    _attachments: attachments,
  };



  info.readmeFilename = pkg.readmeFilename;
  info.homepage = pkg.homepage;
  info.bugs = pkg.bugs;
  info.license = pkg.license;

  debug('show module %s: %s, latest: %s', pkName, rev, latestMod.version);
  // ctx.jsonp = info;
  ctx.body = info;
  // use faster etag
  ctx.etag = etag([
    modifiedTime,
    distTags,
    pkg.maintainers,
    allVersionString,
  ]);

  debug('show module %s: %s, latest: %s', pkName, rev, latestMod.version)
};

const handleAbbreviatedMetaRequest = async (ctx, pkName, modifiedTime, tags, rows, cacheKey) => {
  debug('show %s got %d rows, %d tags, modifiedTime: %s', pkName, rows.length, tags.length, modifiedTime);
  const isJSONPRequest = ctx.query.callback;
  var latestMod = null;
  // set tags
  var distTags = {};
  for (var i = 0; i < tags.length; i++) {
    var t = tags[i];
    distTags[t.tag] = t.version;
  }

  // set versions and times
  var versions = {};
  var allVersionString = '';
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var pkg = row.package;
    common.setDownloadURL(pkg, ctx);
    pkg._publish_on_cnpm = undefined;
    pkg.publish_time = pkg.publish_time || row.publish_time;

    versions[pkg.version] = pkg;
    allVersionString += pkg.version + ',';

    if ((!distTags.latest && !latestMod) || distTags.latest === pkg.version) {
      latestMod = row;
    }
  }

  if (!latestMod) {
    latestMod = rows[0];
  }

  if (tags.length === 0) {
    // some sync error reason, will cause tags missing
    // set latest tag at least
    distTags.latest = latestMod.package.version;
  }

  var info = {
    name: pkName,
    modified: modifiedTime,
    'dist-tags': distTags,
    versions: versions,
  };

  debug('show %j', info);
  // use faster etag
  const resultEtag = etag([
    modifiedTime,
    distTags,
    allVersionString,
  ]);

  if (isJSONPRequest) {
    // ctx.jsonp = info;
    ctx.body = info;
  } else {
    ctx.body = JSON.stringify(info);
    ctx.type = 'json';
    // set cache
    if (cacheKey) {
      // set cache async, dont block the response
      cache.pipeline()
        .hmset(cacheKey, 'etag', resultEtag, 'body', ctx.body)
        // cache 120s
        .expire(cacheKey, 120)
        .exec()
        .catch(err => {
          logger.error(err);
        });
    }
  }
  ctx.etag = resultEtag;
}

const handleAbbreviatedMetaRequestWithFullMeta = (ctx, name, modifiedTime, tags, rows) => {
  debug('show %s got %d rows, %d tags',
    name, rows.length, tags.length);
  var latestMod = null;
  // set tags
  var distTags = {};
  for (var i = 0; i < tags.length; i++) {
    var t = tags[i];
    distTags[t.tag] = t.version;
  }

  // set versions and times
  var versions = {};
  var allVersionString = '';
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    // pkg is string ... ignore it
    if (typeof row.package === 'string') {
      continue;
    }
    // https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md#abbreviated-version-object
    var pkg = {
      name: row.package.name,
      version: row.package.version,
      deprecated: row.package.deprecated,
      dependencies: row.package.dependencies,
      optionalDependencies: row.package.optionalDependencies,
      devDependencies: row.package.devDependencies,
      bundleDependencies: row.package.bundleDependencies,
      peerDependencies: row.package.peerDependencies,
      bin: row.package.bin,
      directories: row.package.directories,
      dist: row.package.dist,
      engines: row.package.engines,
      _hasShrinkwrap: row.package._hasShrinkwrap,
      publish_time: row.package.publish_time || row.publish_time,
    };
    common.setDownloadURL(pkg, ctx);

    versions[pkg.version] = pkg;
    allVersionString += pkg.version + ',';

    if ((!distTags.latest && !latestMod) || distTags.latest === pkg.version) {
      latestMod = row;
    }
  }

  if (!latestMod) {
    latestMod = rows[0];
  }

  if (tags.length === 0) {
    // some sync error reason, will cause tags missing
    // set latest tag at least
    distTags.latest = latestMod.package.version;
  }

  var info = {
    name: name,
    modified: modifiedTime,
    'dist-tags': distTags,
    versions: versions,
  };

  debug('show %j', info);
  // ctx.jsonp = info;
  ctx.body = info;
  // use faster etag
  ctx.etag = etag([
    modifiedTime,
    distTags,
    allVersionString,
  ]);
}