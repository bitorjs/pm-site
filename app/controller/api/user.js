import {
  Controller,
  Get,
  Post,
  Put,
  Middleware
} from 'bitorjs-decorators';

var co = require('co');
var utility = require('utility');

import models from '../../models';
var UserModel = models.User;


@Controller('/')
export default class {

  // curl -d "username=bitores&passwordhttp://localhost:1029/-/v1/change_passwd
  @Post('/-/v1/change_passwd')
  async post_change_pwd(ctx, next) {
    console.log('change_passwd ', ctx.request.body)
    const body = ctx.request.body;
    var user = await UserModel.findOne({ where: { name: body.username } });
    var salt = user.salt;
    console.log(`user original password_sha: ${user.password_sha}`);
    var newPasswordSha = utility.sha1(body.password + salt);
    user.password_sha = newPasswordSha;
    user = await user.save();
    console.log(`change user password successful!! user new password_sha: ${user.password_sha}`);
    ctx.body = {}
  }

  @Get('/-/v1/change_passwd/:username/:password')
  async get_change_pwd(ctx, next) {
    console.log('change_passwd ', ctx.request.body)
    var user = await UserModel.findOne({ where: { name: ctx.params.username } });
    var salt = user.salt;
    console.log(`user original password_sha: ${user.password_sha}`);
    var newPasswordSha = utility.sha1(ctx.params.password + salt);
    user.password_sha = newPasswordSha;
    user = await user.save();
    console.log(`change user password successful!! user new password_sha: ${user.password_sha}`);
    ctx.body = `change user password successful!! user new password_sha: ${user.password_sha}`;
  }

  // @Post('/-/v1/login')
  // async login(ctx, next) {
  //   console.log('login ', ctx.request.body)
  //   // const error = '[unauthorized] Login fail, please check your login name and password';
  //   // ctx.body = {
  //   //   error,
  //   //   reason: error,
  //   // };
  //   // return true;
  // }

  // create a new user => login | adduser
  @Put('/-/user/org.couchdb.user::name')
  @Middleware('add')
  async create_user(ctx) {
  }
  // update
  @Put('/-/user/org.couchdb.user::name/-rev/:rev')
  @Middleware('login')
  async update_user(ctx, next) {
    console.log('user c')
    ctx.body = ctx.params.name;
    return 1;
  }

  @Get('/-/user/org.couchdb.user::name')
  async show_user(ctx, next) {
    var name = ctx.params.name;
    var user = await ctx.$service.User.getAndSave(name);
    if (!user) {
      return await next();
    }

    var data = user.json;
    if (!data) {
      data = {
        _id: 'org.couchdb.user:' + user.name,
        _rev: user.rev,
        name: user.name,
        email: user.email,
        type: 'user',
        roles: [],
        date: user.gmt_modified,
      };
    }

    if (data.login) {
      // custom user format
      // convert to npm user format
      data = {
        _id: 'org.couchdb.user:' + user.name,
        _rev: user.rev,
        name: user.name,
        email: user.email,
        type: 'user',
        roles: [],
        date: user.gmt_modified,
        avatar: data.avatar_url,
        fullname: data.name || data.login,
        homepage: data.html_url,
        scopes: data.scopes,
        site_admin: data.site_admin
      };
    }

    data._cnpm_meta = {
      id: user.id,
      npm_user: user.isNpmUser,
      custom_user: !!data.login,
      gmt_create: user.gmt_create,
      gmt_modified: user.gmt_modified,
    };

    ctx.body = data;
  }
}