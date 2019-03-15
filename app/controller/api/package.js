import {
  Controller,
  Get,
  Delete,
  Middleware
} from 'bitorjs-decorators';

@Controller('/-/package')
export default class {

  // GET /-/package/:pkg/dependents
  @Get('/:name([\\w\\-\\.]+)/dependents')
  async a(ctx, next) {
    console.log('....')
    ctx.body = 1;
  }
  @Get('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/dependents')
  async b(ctx, next) {
    console.log('....')
    ctx.body = 1;
  }

  // GET /-/package/:pkg/dist-tags
  @Get('/:name([\\w\\-\\.]+)/dist-tags')
  async c(ctx, next) {
    console.log('....')
    ctx.body = 1;
  }
  @Get('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/dist-tags')
  async d(ctx, next) {
    console.log('....')
    ctx.body = 1;
  }

  // DELETE /-/package/:pkg/dist-tags/:tag -- Remove tag from dist-tags
  @Delete('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/dist-tags/:tag([\\w\\-\\.]+)')
  @Middleware('login')
  async e(ctx, next) {
    console.log('delete e')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }

  @Delete('/:name([\\w\\-\\.]+)/dist-tags/:tag([\\w\\-\\.]+)')
  @Middleware('login')
  async f(ctx, next) {
    console.log('delete f')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }
}