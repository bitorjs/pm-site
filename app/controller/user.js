import {
  Controller,
  Get,
  Post
} from 'bitorjs-decorators';

@Controller('/user')
export default class {

  @Post('/')
  c(ctx, next) {
    return ctx.response.body = {
      code: '000001',
      msg: '登录成功',
      data: {
        url: ctx.url,
        query: ctx.request.body,
        request: ctx.request
      }
    }
  }
  @Get('/login')
  c(ctx, next) {
    return ctx.response.body = {
      code: '000001',
      msg: '登录成功',
      data: {
        url: ctx.url,
        query: ctx.request.query || ctx.query,
        request: ctx.request
      }
    }
  }

  @Post('/login')
  b(ctx, next) {

    return ctx.response.body = {
      code: '000001',
      msg: '登录成功',
      data: {
        url: ctx.url,
        query: ctx.query,
        body: ctx.request.body,
        request: ctx.request
      }
    }
  }

  @Post('/info')
  a(ctx, next) {
    return ctx.response.body = {
      code: '000001',
      msg: 'Info',
      data: {
        url: ctx.url,
        query: ctx.request.body,
        request: ctx.request
      }
    }
  }
}