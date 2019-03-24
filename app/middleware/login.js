import http from 'http';

export default async (ctx, next) => {
  if (ctx.user.error) {
    var status = ctx.user.error.status;
    ctx.status = http.STATUS_CODES[status]
      ? status
      : 500;

    const error = `[${ctx.user.error.name}] ${ctx.user.error.message}`;
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  if (!ctx.user.name) {
    ctx.status = 401;
    const error = '[unauthorized] Login first';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }
  return await next()
}