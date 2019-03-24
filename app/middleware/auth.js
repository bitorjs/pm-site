
/**
 * Parse the request authorization
 * get the real user
 */

export default async (ctx, next) => {

  ctx.user = {};

  var authorization = (ctx.get('authorization') || '').split(' ')[1] || '';
  authorization = authorization.trim();
  // debug('%s %s with %j', ctx.method, ctx.url, authorization);
  if (!authorization) {
    return await unauthorized(ctx, next);
  }

  authorization = Buffer.from(authorization, 'base64').toString();
  var pos = authorization.indexOf(':');
  if (pos === -1) {
    return await unauthorized(ctx, next);
  }

  var username = authorization.slice(0, pos);
  var password = authorization.slice(pos + 1);

  var row;
  try {
    row = await ctx.$service.User.auth(username, password);
  } catch (err) {
    // do not response error here
    // many request do not need login
    ctx.user.error = err;
  }

  if (!row) {
    // debug('auth fail user: %j, headers: %j', row, ctx.header);
    return await unauthorized(ctx, next);
  }

  ctx.user.name = row.login;
  ctx.user.isAdmin = row.site_admin;
  ctx.user.scopes = row.scopes;
  // debug('auth pass user: %j, headers: %j', ctx.user, ctx.header);
  await next();
};


function unauthorized(ctx, next) {
  if (!ctx.$config.alwaysAuth || ctx.method !== 'GET') {
    return next();
  }
  ctx.status = 401;
  ctx.set('WWW-Authenticate', 'Basic realm="sample"');
  if (ctx.accepts(['html', 'json']) === 'json') {
    const error = '[unauthorized] login first';
    ctx.body = {
      error,
      reason: error,
    };
  } else {
    ctx.body = 'login first';
  }
}
