import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Middleware
} from 'bitorjs-decorators';

import * as tags from '../../middleware/package/dist_tag';

@Controller('/-/package')
export default class {

  // GET /-/package/:pkg/dependents
  @Get('/:name([\\w\\-\\.]+)/dependents')
  async a(ctx, next) {
    console.log('....')
    ctx.body = 1;
  }
  @Get('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/dependents')
  async b(ctx, next) {
    console.log('....')
    ctx.body = 1;
  }

  // GET /-/package/:pkg/dist-tags
  @Get('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/dist-tags')
  @Middleware('exists_package')
  @Middleware(tags.index)
  async dist_tags_with_scope(ctx, next) {
    console.log('package dist_tags_with_scope')
    ctx.body = 1;
  }
  @Get('/:name([\\w\\-\\.]+)/dist-tags')
  @Middleware('exists_package')
  @Middleware(tags.index)
  async dist_tags_without_scope(ctx, next) {
    console.log('package dist_tags_without_scope')
    ctx.body = 1;
  }

  // Add/modify dist-tags from provided object body (merge)
  @Post('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/dist-tags')
  @Middleware('login')
  @Middleware('exists_package')
  @Middleware('editable')
  @Middleware(tags.update)
  async dist_tags_am_with_scope(ctx) {

  }

  @Post('/:name([\\w\\-\\.]+)/dist-tags')
  @Middleware('login')
  @Middleware('exists_package')
  @Middleware('editable')
  @Middleware(tags.update)
  async dist_tags_am_without_scope(ctx) {

  }

  // PUT /-/package/:pkg/dist-tags/:tag -- Set package's dist-tags[tag] to provided string body
  @Put('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/dist-tags/:tag')
  @Middleware('login')
  @Middleware('exists_package')
  @Middleware('editable')
  @Middleware(tags.set)
  async dist_tag_put_with_scope(ctx, next) {
    console.log('delete e')
    console.log(ctx.params)
    ctx.body = {}
  }

  @Put('/:name([\\w\\-\\.]+)/dist-tags/:tag')
  @Middleware('login')
  @Middleware('exists_package')
  @Middleware('editable')
  @Middleware(tags.set)
  async dist_tag_put_without_scope(ctx, next) {
    console.log('delete f')
    console.log(ctx.params)
  }


  // DELETE /-/package/:pkg/dist-tags/:tag -- Remove tag from dist-tags
  @Delete('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/dist-tags/:tag')
  @Middleware('login')
  @Middleware('exists_package')
  @Middleware('editable')
  @Middleware(tags.destroy)
  async e(ctx, next) {
    console.log('delete e')
    console.log(ctx.params)
    ctx.body = {}
  }

  @Delete('/:name([\\w\\-\\.]+)/dist-tags/:tag')
  @Middleware('login')
  @Middleware('exists_package')
  @Middleware('editable')
  @Middleware(tags.destroy)
  async f(ctx, next) {
    console.log('delete f')
    console.log(ctx.params)
    ctx.body = {}
  }


  // 暂时废弃
  // // cnpm access public
  // @Post('/:name(@[\\w\\-\\.]+\/[\\w\\-\\.]+)/access')
  // @Middleware('login')
  // @Middleware('exists_package')
  // @Middleware('editable')
  // @Middleware(async (ctx) => {
  //   console.log('access_with_scope')
  // })
  // async access_with_scope(ctx) {

  // }

  // @Post('/:name([\\w\\-\\.]+)/access')
  // @Middleware('login')
  // @Middleware('exists_package')
  // @Middleware('editable')
  // @Middleware(async (ctx) => {

  // })
  // async access_without_scope(ctx) {
  //   console.log('access_without_scope')
  // }

}