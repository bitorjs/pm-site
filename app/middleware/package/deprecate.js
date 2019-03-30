export default async (ctx, next) => {

  var body = ctx.request.body;
  var name = ctx.params.name || ctx.params[0];

  var tasks = [];
  for (var version in body.versions) {
    tasks.push(ctx.$service.package.getModule(name, version));
  }
  var rs = await tasks;

  var updateTasks = [];
  for (var i = 0; i < rs.length; i++) {
    var row = rs[i];
    if (!row) {
      // some version not exists
      ctx.status = 400;
      const error = '[version_error] Some versions: ' + JSON.stringify(Object.keys(body.versions)) + ' not found';
      ctx.body = {
        error,
        reason: error,
      };
      return;
    }
    var data = body.versions[row.package.version];
    if (typeof data.deprecated === 'string') {
      row.package.deprecated = data.deprecated;
      updateTasks.push(ctx.$service.package.updateModulePackage(row.id, row.package));
    }
  }
  await updateTasks;
  // update last modified
  await ctx.$service.package.updateModuleLastModified(name);

  ctx.status = 201;
  ctx.body = {
    ok: true,
  };
}
