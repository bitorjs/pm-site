var debug = require('debug')('cnpmjs.org:middleware:web_not_found');

export default async (ctx, next) => {
  await next();

  if (ctx.status && ctx.status !== 404) {
    return;
  }
  if (ctx.body) {
    return;
  }

  var m = /^\/([\w\-\.]+)\/?$/.exec(ctx.path);
  if (!m) {
    // scoped packages
    m = /^\/(@[\w\-\.]+\/[\w\-\.]+)$/.exec(ctx.path);
  }
  debug('%s match %j', ctx.url, m);
  if (m) {
    return ctx.redirect('/package/' + m[1]);
  }

  // package not found
  m = /\/package\/([\w\-\_\.]+)\/?$/.exec(ctx.url);
  var name = null;
  var title = '404: Page Not Found';
  if (m) {
    name = m[1];
    title = name + ' Not Found';
  }

  ctx.status = 404;
  await ctx.render('404', {
    title: title,
    name: name
  });
}