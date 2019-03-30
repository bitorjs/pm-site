'use strict';

var debug = require('debug')('cnpmjs.org:controllers:registry:package:tag');
var semver = require('semver');
var util = require('util');

// PUT /:name/:tag
// https://github.com/npm/npm-registry-client/blob/master/lib/tag.js#L4
// this.request("PUT", uri+"/"+tagName, { body : JSON.stringify(version) }, cb)
export default async (ctx) => {
  var version = ctx.request.body;
  var name = ctx.params.name || ctx.params[0];
  var tag = ctx.params.tag || ctx.params[1];
  debug('tag %j to %s/%s', version, name, tag);

  if (!version) {
    ctx.status = 400;
    const error = '[version_missed] version not found';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  if (!semver.valid(version)) {
    ctx.status = 403;
    const error = util.format('[forbidden] setting tag %s to invalid version: %s: %s/%s',
      tag, version, name, tag);
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  var mod = await ctx.$service.package.getModule(name, version);
  if (!mod) {
    ctx.status = 403;
    const error = util.format('[forbidden] setting tag %s to unknown version: %s: %s/%s',
      tag, version, name, tag);
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  var row = await ctx.$service.package.addModuleTag(name, tag, version);
  ctx.status = 201;
  ctx.body = {
    ok: true,
    modified: row.gmt_modified,
  };
};
