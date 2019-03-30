import {
  Controller,
  Put,
  Middleware
} from 'bitorjs-decorators';

@Controller('/')
export default class {

  // publish or star module  
  @Put('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('publishable')
  @Middleware('save')
  async publish_with_scope(ctx, next) {
    console.log('publish_with_scope', ctx.url)
    return 1;
  }
  // publish or star module  
  @Put('/:name([\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('publishable')
  @Middleware('save')
  async publish_without_scope(ctx, next) {
    console.log('publish_without_scope', ctx.url)
    return 1;
  }

  // add tag
  @Put('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/:tag([\\w\\-\\.]+)')
  // @Middleware('login')
  // @Middleware('editable')
  // @Middleware('tag')
  async c(ctx, next) {
    console.log('c')
    console.log(ctx.params)
    ctx.body = '@'
    return 1;
  }

  // unpublish will PUT this or owner
  @Put('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/-rev/:rev([\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('publishable')
  @Middleware('editable')
  @Middleware('update')
  async update_unpublish_with_scope(ctx, next) {
    console.log('put update_unpublish_with_scope')
    ctx.body = ctx.params.name;
    return 1;
  }

  @Put('/:name([\\w\\-\\.]+)/-rev/:rev([\\w\\-\\.]+)')
  @Middleware('login')
  @Middleware('publishable')
  @Middleware('editable')
  @Middleware('update')
  async update_unpublish_without_scope(ctx, next) {
    console.log('put update_unpublish_without_scope')
    ctx.body = ctx.params.name;
    return 1;
  }

}