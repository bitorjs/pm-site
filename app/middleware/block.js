export default async (ctx, next) => {
  var ua = String(ctx.get('user-agent')).toLowerCase();
  if (ua === 'ruby') {
    ctx.status = 403;
    return ctx.body = {
      message: 'forbidden Ruby user-agent, ip: ' + ctx.ip
    };
  }
  await next();
};
