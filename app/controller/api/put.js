import {
  Controller,
  Put,
  Middleware
} from 'bitorjs-decorators';

@Controller('/')
export default class {

  // add module  
  @Put('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('publishable')
  @Middleware('savePackage')
  async a(ctx, next) {
    console.log('a', ctx.url)
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }

  // add tag
  @Put('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/:tag([\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('editable')
  @Middleware('tag')
  async c(ctx, next) {
    console.log('c')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }

  // update module, unpublish will PUT this
  @Put('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/-rev/:rev([\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('publishable')
  @Middleware('editable')
  @Middleware('updatePackage')
  async e(ctx, next) {
    console.log('e')
    ctx.body = ctx.params.name;
    return 1;
  }

}