import {
  Controller,
  Get,
  Post
} from 'bitorjs-decorators';

@Controller('/')
export default class {

  @Get('*')
  c(ctx, next) {
    ctx.response.body = '<h1>404 Not Found</h1>'
    // ctx.redirect('/');

  }
}