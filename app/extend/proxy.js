import koaProxy from 'koa-proxies';

export default app => {
  console.log('use proxy')
  const proxy = {
    '/-/npm/v1/security/audits': {
      target: 'https://registry.npmjs.org',
      changeOrigin: true,
    }
  }

  for (const key in proxy) {
    if (proxy.hasOwnProperty(key)) {
      const item = proxy[key];
      app.use(koaProxy(key, {
        target: item.target,
        changeOrigin: item.changeOrigin,
        rewrite: item.pathRewrite,
        logs: true
      }))
    }
  }
}