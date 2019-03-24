import {
  Controller,
  Delete,
  Middleware
} from 'bitorjs-decorators';

@Controller('/')
export default class {

  // uppublish all versions
  @Delete('/:name(@?[\\w\\-\\.]+\/[\\w\\-\\.]+)/-rev/:rev')
  @Middleware('login')
  async a(ctx, next) {
    console.log('delete a')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }

  // uppublish all versions
  @Delete('/:name(@?[\\w\\-\\.]+\/[\\w\\-\\.]+)/download/:filename(.+)/-rev/:rev')
  @Middleware('login')
  async c(ctx, next) {
    console.log('delete c')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }

  @Delete('/:name/download/:filename(.+)/-rev/:rev')
  @Middleware('login')
  async d(ctx, next) {
    console.log('delete d')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }

}