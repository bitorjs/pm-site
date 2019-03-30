import {
  Controller,
  Delete,
  Middleware
} from 'bitorjs-decorators';

@Controller('/')
export default class {

  // remove all versions
  @Delete('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/-rev/:rev')
  @Middleware('login')
  @Middleware('unpublishable')
  @Middleware('remove')
  async unpublish_lastone_with_scope(ctx, next) {
    console.log('delete unpublish_lastone_with_scope')
    return 1;
  }

  @Delete('/:name([\\w\\-\\.]+)/-rev/:rev')
  @Middleware('login')
  @Middleware('unpublishable')
  @Middleware('remove')
  async unpublish_lastone_without_scope(ctx, next) {
    console.log('delete unpublish_lastone_without_scope', ctx.params, ctx.url)
    return 1;
  }

  // delete tarball and remove one version
  @Delete('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/download/:filename(.+)/-rev/:rev')
  @Middleware('login')
  @Middleware('unpublishable')
  @Middleware('remove_version')
  async unpublish_one_with_scope(ctx, next) {
    console.log('delete unpublish_one_with_scope')
    return 1;
  }
  @Delete('/:name([\\w\\-\\.]+)/download/:filename(.+)/-rev/:rev')
  @Middleware('login')
  @Middleware('unpublishable')
  @Middleware('remove_version')
  async unpublish_one_without_scope(ctx, next) {
    console.log('delete unpublish_one_without_scope')
    return 1;
  }
}