import { ensurePasswordSalt } from '../../lib/common';
export default async (ctx, next) => {
  console.log('user b', ctx.params, ctx.request.body)
  var name = ctx.params.name;
  var body = ctx.request.body || {};
  if (!body.password || !body.name) {
    ctx.status = 422;
    const error = '[param_error] params missing, name, email or password missing';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }
  var loginedUser;
  try {
    loginedUser = await ctx.$service.User.authAndSave(body.name, body.password);
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message,
      reason: err.message,
    };
    return;
  }
  if (loginedUser) {
    ctx.status = 201;
    ctx.body = {
      ok: true,
      id: 'org.couchdb.user:' + loginedUser.login,
      rev: Date.now() + '-' + loginedUser.login
    };
    return;
  }
  if (ctx.$config.customUserService) {
    // user login fail, not allow to add new user
    ctx.status = 401;
    const error = '[unauthorized] Login fail, please check your login name and password';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  var user = {
    name: body.name,
    // salt: body.salt,
    // password_sha: body.password_sha,
    email: body.email,
    ip: ctx.ip || '0.0.0.0',
    // roles: body.roles || [],
  };


  ensurePasswordSalt(user, body);

  if (!user.salt || !user.password_sha || !user.email) {
    ctx.status = 422;
    const error = '[param_error] params missing, name, email or password missing';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  var existUser = await ctx.$service.User.get(name);
  if (existUser) {
    ctx.status = 409;
    const error = '[conflict] User ' + name + ' already exists';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  // add new user
  var result = await ctx.$service.User.add(user);
  ctx.etag = '"' + result.rev + '"';
  ctx.status = 201;
  ctx.body = {
    ok: true,
    id: 'org.couchdb.user:' + name,
    rev: result.rev
  };
}