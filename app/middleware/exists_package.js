export default async (ctx, next) => {
  var name = ctx.params.name || ctx.params[0];
  var pkg = await ctx.$service.package.getLatestModule(name);
  if (pkg) {
    return await next();
  }
  ctx.status = 404;
  const error = '[not_found] document not found';
  ctx.body = {
    error,
    reason: error,
  };
}