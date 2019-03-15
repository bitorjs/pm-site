import {
  Controller,
  Delete,
  Middleware
} from 'bitorjs-decorators';

@Controller('/')
export default class {

  // uppublish all versions
  @Delete('/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/-rev/:rev([\\w\\-\\.]+)')
  @Middleware('login')
  async a(ctx, next) {
    console.log('delete a')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }

  @Delete('/:name/-rev/:rev')
  @Middleware('login')
  async b(ctx, next) {
    console.log('delete b')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }



}