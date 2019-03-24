export default async (ctx, next) => {
  var username = ctx.user && ctx.user.name;
  var moduleName = ctx.params.name || ctx.params[0];
  if (username && moduleName) {
    if (ctx.user.isAdmin) {
      return await next();
    }
    var isMaintainer = await ctx.$service.package.isMaintainer(moduleName, username);
    if (isMaintainer) {
      return await next();
    }
  }

  ctx.status = 403;
  var message = 'not authorized to modify ' + moduleName;
  if (username) {
    message = username + ' ' + message;
  }
  message = '[forbidden] ' + message;
  ctx.body = {
    error: message,
    reason: message,
  };
}