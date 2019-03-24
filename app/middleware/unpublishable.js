export default async (ctx, next) => {
  if (!ctx.user.isAdmin) {
    ctx.status = 403;
    const error = '[no_perms] Only administrators can unpublish module';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }
  await next();
}