export default async (ctx, next) => {
  await next();

  if (ctx.status && ctx.status !== 404) {
    return;
  }
  if (ctx.body && ctx.body.name) {
    return;
  }

  ctx.status = 404;
  const error = '[not_found] document not found';
  ctx.body = {
    error,
    reason: error,
  };
};
