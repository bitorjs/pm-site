var limit = require('koa-limit');
var convert = require('koa-convert');
export default async (ctx, next) => {
  if (ctx.$config.limit.enable) {
    await convert(limit(ctx.$config.limit))
  }
  await next()
}