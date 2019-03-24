import {
  Controller,
  Get,
  Middleware
} from 'bitorjs-decorators';

import { User } from '../../models';

@Controller('/')
export default class {

  @Get('/')
  async a(ctx, next) {

    console.log(User.findAll)

    ctx.body = {};
  }

  // before /:name/:version
  // get all modules, for npm search
  @Get('/-/all')
  async b(ctx, next) {

    return 1;
  }

  @Get('/-/all/since')
  async c(ctx, next) {
    return 1;
  }
  // get all module names, for auto completion
  @Get('/-/short')
  async d(ctx, next) {
    return 1;
  }

  // install module
  // scope package: params: [$name]
  @Get('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)')
  @Middleware('syncByInstall')
  @Middleware('list')
  async e(ctx, next) {
    console.log('get e', ctx.params)
    ctx.body = {};
    return 1;
  }
  @Get('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/:version')//([^\/]+)
  async f(ctx, next) {
    console.log('get f', ctx.params)
    // ctx.body = ctx.params.version;
    return 1;
  }
  @Get('/:name([\\w\\-\\.]+)')
  // @Middleware('syncByInstall')
  // @Middleware('list')
  async g(ctx, next) {
    console.log('get g')
    ctx.body = ctx.params.name;
    return 1;
  }
  @Get('/:name([\\w\\-\\.]+)/:version([^\/]+)')
  async h(ctx, next) {
    console.log('get h')
    ctx.body = ctx.params.name;
    return 1;
  }

  // need limit by ip
  @Get('/:name(@.+)/download/:filename(.+)')
  @Middleware('download')
  async i(ctx, next) {
    console.log('get i', ctx.params)
    ctx.body = {};
    return 1;
  }
  @Get('/:name(@.+)/-/:filename(.+)')
  async j(ctx, next) {
    console.log('get j', ctx.params)
    // ctx.body = ctx.params.version;
    return 1;
  }
  @Get('/:name([\\w\\-\\.]+)/download/:filename')
  // @Middleware('syncByInstall')
  // @Middleware('list')
  async k(ctx, next) {
    console.log('get k')
    ctx.body = ctx.params.name;
    return 1;
  }
  @Get('/:name([\\w\\-\\.]+)/-/:filename')
  async l(ctx, next) {
    console.log('get l')
    ctx.body = ctx.params.name;
    return 1;
  }

  // list all packages of user
  @Get('/-/by-user/:user')
  async m(ctx, next) {
    ctx.body = ctx.params.name;
    return 1;
  }
  @Get('/-/users/:user/packages')
  async n(ctx, next) {
    ctx.body = ctx.params.name;
    return 1;
  }
}