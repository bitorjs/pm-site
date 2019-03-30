import {
  Controller,
  Get,
  Middleware
} from 'bitorjs-decorators';

import { User } from '../../models';

@Controller('/')
export default class {

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
  @Get('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)')
  @Middleware('syncByInstall')
  @Middleware('list')
  async install_with_scope(ctx, next) {
    console.log('get g')
    ctx.body = ctx.params.name;
    return 1;
  }

  @Get('/:name([\\w\\-\\.]+)')//
  @Middleware('syncByInstall')
  @Middleware('list')
  async install_without_scope(ctx, next) {
    console.log('get g')
    ctx.body = ctx.params.name;
    return 1;
  }

  @Get('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/:version([^\/]+)')//
  @Middleware('syncByInstall')
  @Middleware('show')
  async f(ctx, next) {
    console.log('get f', ctx.params)
    return 1;
  }
  @Get('/:name([\\w\\-\\.]+)/:version([^\/]+)')// 
  @Middleware('syncByInstall')
  @Middleware('show')
  async f2(ctx, next) {
    console.log('get f', ctx.params)
    return 1;
  }

  // need limit by ip
  @Get('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/:d(download|\-)/:filename(.+)')
  @Middleware('limit')
  @Middleware('download')
  async dowload_with_scope(ctx, next) {
    console.log('get i', ctx.params)
    return 1;
  }
  @Get('/:name([\\w\\-\\.]+)/:d(download|\-)/:filename(.+)')
  @Middleware('limit')
  @Middleware('download')
  async dowload_without_scope(ctx, next) {
    console.log('get i', ctx.params)
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