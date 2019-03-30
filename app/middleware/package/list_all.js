
// GET /-/all
// List all packages names
// https://github.com/npm/npm-registry-client/blob/master/lib/get.js#L86
export default async (ctx, next) => {
  var updated = Date.now();
  var names = await ctx.$service.package.listAllPublicModuleNames();
  var result = { _updated: updated };
  names.forEach(function (name) {
    result[name] = true;
  });
  ctx.body = result;
};
