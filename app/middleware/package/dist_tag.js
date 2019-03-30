
function ok() {
  return {
    ok: "dist-tags updated"
  };
}

// GET /-/package/:pkg/dist-tags -- returns the package's dist-tags
export const index = async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];
  var rows = await ctx.$service.package.listModuleTags(name);
  var tags = {};
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    tags[row.tag] = row.version;
  }
  ctx.body = tags;
};

// PUT /-/package/:pkg/dist-tags -- Set package's dist-tags to provided object body (removing missing)
export const save = async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];
  await ctx.$service.package.removeModuleTags(name);
  await update.call(null, ctx);
};

// POST /-/package/:pkg/dist-tags -- Add/modify dist-tags from provided object body (merge)
export const update = async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];
  var tags = ctx.request.body;
  for (var tag in tags) {
    var version = tags[tag];
    await ctx.$service.package.addModuleTag(name, tag, version);
  }
  ctx.status = 201;
  ctx.body = ok();
};

// PUT /-/package/:pkg/dist-tags/:tag -- Set package's dist-tags[tag] to provided string body
// POST /-/package/:pkg/dist-tags/:tag -- Same as PUT /-/package/:pkg/dist-tags/:tag
export const set = async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];
  var tag = ctx.params.tag || ctx.params[1];
  var version = ctx.request.body;
  // make sure version exists
  var pkg = await ctx.$service.package.getModule(name, version);
  if (!pkg) {
    ctx.status = 400;
    const error = '[version_error] ' + name + '@' + version + ' not exists';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  await ctx.$service.package.addModuleTag(name, tag, version);
  ctx.status = 201;
  ctx.body = ok();
};

// DELETE /-/package/:pkg/dist-tags/:tag -- Remove tag from dist-tags
export const destroy = async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];
  var tag = ctx.params.tag || ctx.params[1];
  if (tag === 'latest') {
    ctx.status = 400;
    const error = '[dist_tag_error] Can\'t not delete latest tag';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }
  await ctx.$service.package.removeModuleTagsByNames(name, tag);
  ctx.body = ok();
};
