import {
  Controller,
  Get,
  Post,
  Middleware
} from 'bitorjs-decorators';
import index from '../view/index';
import search from '../view/search';

@Controller('/')
export default class {
  @Get('/')
  async index(a, b, c) {

    this.ctx.render(index, {
      data: this.ctx.$store.state.ttt.data
    })
  }

  @Get('/search')
  async search(a, b, c) {

    this.ctx.render(search, {
      data: this.ctx.$store.state.ttt.data
    })
  }

  @Get('/package')
  async package(a, b, c) {

    this.ctx.render(search, {
      data: this.ctx.$store.state.ttt.data
    })
  }
}