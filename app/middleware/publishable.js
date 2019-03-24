var util = require('util');
var debug = require('debug')('cnpmjs.org:middlewares/publishable');

export default async (ctx, next) => {
  // admins always can publish and unpublish
  if (ctx.user.isAdmin) {
    return await next();
  }

  // private mode, normal user can't publish and unpublish
  if (ctx.$config.enablePrivate) {
    ctx.status = 403;
    const error = '[no_perms] Private mode enable, only admin can publish ctx module';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  // public mode, normal user have permission to publish `scoped package`
  // and only can publish with scopes in `ctx.user.scopes`, default is `config.scopes`

  var name = ctx.params.name;

  // check if is private package list in config
  if (ctx.$config.privatePackages && ctx.$config.privatePackages.indexOf(name) !== -1) {
    return await next();
  }

  // scoped module
  if (name[0] === '@') {
    if (checkScope(name, ctx)) {
      return await next();
    }
    return;
  }
  // none-scope
  assertNoneScope(name, ctx);
}

/**
 * check module's scope legal
 */

function checkScope(name, ctx) {
  if (!ctx.user.scopes || !ctx.user.scopes.length) {
    ctx.status = 404;
    return false;
  }

  var scope = name.split('/')[0];
  if (ctx.user.scopes.indexOf(scope) === -1) {
    debug('assert scope  %s error', name);
    ctx.status = 400;
    const error = util.format('[invalid] scope %s not match legal scopes: %s', scope, ctx.user.scopes.join(', '));
    ctx.body = {
      error,
      reason: error,
    };
    return false;
  }

  return true;
}

/**
 * check if user have permission to publish without scope
 */

function assertNoneScope(name, ctx) {
  ctx.status = 403;
  if (ctx.user.scopes.length === 0) {
    const error = '[no_perms] can\'t publish non-scoped package, please set `config.scopes`';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  const error = '[no_perms] only allow publish with ' + ctx.user.scopes.join(', ') + ' scope(s)';
  ctx.body = {
    error,
    reason: error,
  };
}
