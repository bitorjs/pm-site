export default {
  enableAbbreviatedMetadata: true,
  customRegistryMiddlewares: [
    async (ctx, next) => {
      ctx.set('x-custom-middleware', 'true');
      await next()
    }
  ]
}