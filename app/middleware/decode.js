

export default async (ctx, next) => {
  try {
    ctx.url = decodeURIComponent(ctx.url);
  } catch (e) {
  }

  await next()
}