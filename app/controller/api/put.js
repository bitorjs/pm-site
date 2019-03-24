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
  @Middleware('publishable')
  @Middleware('savePackage')
  async a(ctx, next) {
    console.log('a', ctx.url)
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }

  @Put('/:name([\\w\\-\\.]+)')//
  @Middleware('login')
  @Middleware('publishable')
  @Middleware('savePackage')
  async b(ctx, next) {
    console.log('b', ctx.url)
    ctx.body = ctx.params.name;
    return 1;
  }

  // add tag
  @Put('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/:tag([\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('editable')
  @Middleware('tag')
  async c(ctx, next) {
    console.log('c')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }
  @Put('/:name([\\w\\-\\.]+)/:tag([\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('editable')
  @Middleware('tag')
  async d(ctx, next) {
    console.log('d')
    ctx.body = ctx.params.name;
    return 1;
  }

  // update module, unpublish will PUT this
  @Put('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/-rev/:rev([\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('publishable')
  @Middleware('editable')
  @Middleware('updatePackage')
  async e(ctx, next) {
    console.log('e')
    ctx.body = ctx.params.name;
    return 1;
  }
  @Put('/:name([\\w\\-\\.]+)/-rev/:rev([\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('publishable')
  @Middleware('editable')
  @Middleware('updatePackage')
  async f(ctx, next) {
    console.log('f')
    ctx.body = ctx.params.name;
    return 1;
  }

}