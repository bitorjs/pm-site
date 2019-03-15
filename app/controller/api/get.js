import {
  Controller,
  Get,
  Middleware
} from 'bitorjs-decorators';

@Controller('/')
export default class {

  @Get('/')
  async a(ctx, next) {

    ctx.body = 'api total';
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
  async e(ctx, next) {
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }
  @Get('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/:version([^\/]+)')
  async f(ctx, next) {
    ctx.body = ctx.params.version;
    return 1;
  }
  @Get('/:name([\\w\\-\\.]+)')
  @Middleware('syncByInstall')
  async g(ctx, next) {
    console.log('get g')
    ctx.body = ctx.params.name;
    return 1;
  }
  @Get('/:name([\\w\\-\\.]+)/:version([^\/]+)')
  async h(ctx, next) {
    ctx.body = ctx.params.name;
    return 1;
  }

  // list all packages of user
  @Get('/-/by-user/:user')
  async i(ctx, next) {
    ctx.body = ctx.params.name;
    return 1;
  }
  @Get('/-/users/:user/packages')
  async j(ctx, next) {
    ctx.body = ctx.params.name;
    return 1;
  }
}