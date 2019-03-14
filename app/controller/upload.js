import {
  Controller,
  Get,
  Post
} from 'bitorjs-decorators';

@Controller('/upload')
export default class {

  @Post('/')
  b(ctx, next) {
    ctx.response.body = {
      code: '000001',
      msg: '上传成功',
      data: {
        url: ctx.url,
        files: ctx.request.files,
        query: ctx.request.body,
        request: ctx.request
      }
    }
  }
}