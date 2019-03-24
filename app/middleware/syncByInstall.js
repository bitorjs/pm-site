
export default async (ctx, next) => {
  ctx.allowSync = false;
  if (!ctx.$config.syncByInstall) {
    // only config.enablePrivate should enable sync on install
    return await next();
  }

  // request not by node, consider it request from web, don't sync
  var ua = ctx.get('user-agent');
  if (!ua || ua.indexOf('node') < 0) {
    return await next();
  }

  // if request with `/xxx?write=true`, meaning the read request using for write, don't sync
  if (ctx.query.write) {
    return await next();
  }

  var scope = ctx.params.scope;
  var name = ctx.params.name;
  var pkName = scope ? `@${scope}/${name}` : name;

  // private scoped package don't sync
  if (pkName && pkName[0] === '@') {
    scope = `@${scope}`;
    if (ctx.$config.scopes.indexOf(scope) >= 0) {
      return await next();
    }
  }

  ctx.allowSync = true;
  await next();
}