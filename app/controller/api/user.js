import {
  Controller,
  Post,
  Put,
  Middleware
} from 'bitorjs-decorators';

import { ensurePasswordSalt } from '../../lib/common';


@Controller('/')
export default class {

  // create a new user
  @Put('/-/user/org.couchdb.user::name')
  async b(ctx, next) {
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
      loginedUser = await ctx.$service.user.authAndSave(body.name, body.password);
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

    var existUser = await ctx.$service.user.get(name);
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
    var result = await ctx.$service.user.add(user);
    ctx.etag = '"' + result.rev + '"';
    ctx.status = 201;
    ctx.body = {
      ok: true,
      id: 'org.couchdb.user:' + name,
      rev: result.rev
    };
  }
  // update
  @Put('/-/user/org.couchdb.user::name/-rev/:rev')
  @Middleware('login')
  async c(ctx, next) {
    console.log('user c')
    ctx.body = ctx.params.name;
    return 1;
  }

}