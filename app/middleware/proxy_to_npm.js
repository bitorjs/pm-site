var debug = require('debug')('cnpmjs.org:middleware:proxy_to_npm');

export default async (ctx, next) => {
  var redirectUrl = ctx.$config.sourceNpmRegistry;
  var proxyUrls = [
    // /:pkg, dont contains scoped package
    // /:pkg/:versionOrTag
    /^\/[\w\-\.]+(?:\/[\w\-\.]+)?$/,
    // /-/package/:pkg/dist-tags
    /^\/\-\/package\/[\w\-\.]+\/dist-tags/,
  ];
  var scopedUrls = [
    // scoped package
    /^\/(@[\w\-\.]+)\/[\w\-\.]+(?:\/[\w\-\.]+)?$/,
    /^\/\-\/package\/(@[\w\-\.]+)\/[\w\-\.]+\/dist\-tags/,
  ];

  if (ctx.$config.syncModel !== 'none') {
    return await next();
  }

  // syncModel === none
  // only proxy read requests
  if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
    return await next();
  }

  var pathname = decodeURIComponent(ctx.path);

  var isScoped = false;
  var isPublichScoped = false;
  // check scoped name
  if (ctx.$config.scopes && ctx.$config.scopes.length > 0) {
    for (var i = 0; i < scopedUrls.length; i++) {
      const m = scopedUrls[i].exec(pathname);
      if (m) {
        isScoped = true;
        if (ctx.$config.scopes.indexOf(m[1]) !== -1) {
          // internal scoped
          isPublichScoped = false;
        } else {
          isPublichScoped = true;
        }
        break;
      }
    }
  }

  var isPublich = false;
  if (!isScoped) {
    for (var i = 0; i < proxyUrls.length; i++) {
      isPublich = proxyUrls[i].test(pathname);
      if (isPublich) {
        break;
      }
    }
  }

  if (isPublich || isPublichScoped) {
    var url = redirectUrl + ctx.url;
    debug('proxy isPublich: %s, isPublichScoped: %s, package to %s',
      isPublich, isPublichScoped, url);
    ctx.redirect(url);
    return;
  }

  await next();
}