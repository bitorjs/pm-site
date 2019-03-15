import {
  Controller,
  Put,
  Middleware
} from 'bitorjs-decorators';

@Controller('/')
export default class {

  // add module
  @Put('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)')
  @Middleware('login')
  async a(ctx, next) {
    console.log('a')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }
  @Put('/:name')
  @Middleware('login')
  async b(ctx, next) {
    console.log('b')
    ctx.body = ctx.params.name;
    return 1;
  }

  // add tag
  @Put('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/:tag([\\w\\-\\.]+)')
  @Middleware('login')
  async c(ctx, next) {
    console.log('c')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }
  @Put('/:name/:tag')
  @Middleware('login')
  async d(ctx, next) {
    console.log('d')
    ctx.body = ctx.params.name;
    return 1;
  }

  // update module, unpublish will PUT this
  @Put('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/-rev/:rev([\\w\\-\\.]+)')
  @Middleware('login')
  async e(ctx, next) {
    console.log('e')
    ctx.body = ctx.params.name;
    return 1;
  }
  @Put('/:name/-rev/:rev')
  @Middleware('login')
  async f(ctx, next) {
    console.log('f')
    ctx.body = ctx.params.name;
    return 1;
  }

}