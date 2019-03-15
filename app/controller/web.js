import {
    Controller,
    Get,
    Middleware
  } from 'bitorjs-decorators';
  
  @Controller('/')
  export default class {
    // @Get('/')
    @Get('/total')
    async total(){
        ctx.body = 'total'
    }
  
    // showPackage
    @Get('/package/@:scope([\\w\\-\\.]+)/:name([\\w\\-\\.]+)/:v(v)?/:version([\\w\\-\\d\\.]+)?')
    async a(ctx, next) {
      console.log(ctx.params)
      ctx.body='@2'
      return 1;
    }
    @Get('/package/:name([\\w\\-\\.]+)/:v(v)?/:version([\\w\\-\\d\\.]+)?')
    async b(ctx, next) {
      console.log(ctx.params)
      ctx.body='@2'
      return 1;
    }

    // listPrivates
    @Get('/privates')
    async c(ctx, next) {
      console.log(ctx.params)
      ctx.body='@2'
      return 1;
    }

    // searchPackage
    @Get('/browse/keyword/@:scope([\\w\\-\\.]+)/:word([\\w\\-\\.]+)')
    async d(ctx, next) {
      console.log(ctx.params)
      ctx.body='@2'
      return 1;
    }
    @Get('/browse/keyword/:word([\\w\\-\\.]+)')
    async e(ctx, next) {
      console.log(ctx.params)
      ctx.body='@2'
      return 1;
    }

    // showUser
    @Get('/~:name')
    async f(ctx, next) {
      console.log(ctx.params)
      ctx.body='@2'
      return 1;
    }

  }