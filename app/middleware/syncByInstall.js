
export default async (ctx, next) => {
  ctx.allowSync = false;
  if (!ctx.$config.syncByInstall) {
    // only config.enablePrivate should enable sync on install
    return next();
  }
  // request not by node, consider it request from web, don't sync
  var ua = ctx.get('user-agent');
  if (!ua || ua.indexOf('node') < 0) {
    return next();
  }

  // if request with `/xxx?write=true`, meaning the read request using for write, don't sync
  if (ctx.query.write) {
    return next();
  }

  var name = ctx.params.name || ctx.params[0];

  // private scoped package don't sync
  if (name && name[0] === '@') {
    var scope = name.split('/')[0];
    if (ctx.$config.scopes.indexOf(scope) >= 0) {
      return next();
    }
  }

  ctx.allowSync = true;
  next();
}