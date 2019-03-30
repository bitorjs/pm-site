
var A_WEEK_MS = 3600000 * 24 * 7;
var TWA_DAYS_MS = 3600000 * 24 * 2;

// GET /-/all/since?stale=update_after&startkey={key}
// List packages names since startkey
// https://github.com/npm/npm-registry-client/blob/master/lib/get.js#L89
export default async (ctx) => {
  var query = ctx.query;
  if (query.stale !== 'update_after') {
    ctx.status = 400;
    const error = '[query_parse_error] Invalid value for `stale`.';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  var startkey = Number(query.startkey);
  if (!startkey) {
    ctx.status = 400;
    const error = '[query_parse_error] Invalid value for `startkey`.';
    ctx.body = {
      error,
      reason: error,
    };
    return;
  }

  var updated = Date.now();
  if (updated - startkey > A_WEEK_MS) {
    startkey = updated - TWA_DAYS_MS;
    console.warn('[%s] list modules since time out of range: query: %j, ip: %s, limit to %s',
      Date(), query, ctx.ip, startkey);
  }

  var names = await ctx.$service.package.listPublicModuleNamesSince(startkey);
  var result = { _updated: updated };
  names.forEach(function (name) {
    result[name] = true;
  });

  ctx.body = result;
};
