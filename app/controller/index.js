import {
  Controller,
  Get,
  Post,
  Middleware
} from 'bitorjs-decorators';
import index from '../view/index';

@Controller('/')
@Middleware('forbidden')
@Middleware((ctx,next)=>{
  console.warn("ddddd...")
  next()
})
export default class {
  @Get('/')
  @Middleware('forbidden')
  @Middleware((ctx,next)=>{
    console.warn("yyyy")
    next()
  })
  async icon(a, b, c) {
    console.warn(a, b, c)

    let r = await this.ctx.$post("/api/data/2/3");
    this.ctx.render(index, {
      data: this.ctx.$store.state.ttt.data
    })
  }

  @Post('/api/data/:id/:user')
  @Middleware((req,next)=>{
    console.warn("bbbbb...")
    req.params = Object.assign(req.params, {
      test:1
    })
    next()
  })
  async b(req) {
    console.warn('eeee...', req)
    console.warn('$$$$--',await this.ctx.$service.ff.aa())
    return this.ctx.$store.state.ttt.data;
  }
}