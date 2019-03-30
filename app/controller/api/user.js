import {
  Controller,
  Get,
  Post,
  Put,
  Middleware
} from 'bitorjs-decorators';

@Controller('/')
export default class {

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
  async show(ctx, next) {
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