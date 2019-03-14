import koaProxy from 'koa-proxies';

export default app => {
  console.log('use proxy')
  const logs = true;
  const proxy = {
    '/proxy/style': {
      target: 'http://mizhifa.com',
      changeOrigin: true,
      pathRewrite: path => path.replace('/proxy/style', '/css/mfxy.css'),
    },
    '/proxy/login': {
      target: 'http://mizhifa.com',
      changeOrigin: true,
      pathRewrite: path => path.replace('/proxy/login', '/css/mfxy.css'),
    },
  }

  for (const key in proxy) {
    if (proxy.hasOwnProperty(key)) {
      const item = proxy[key];
      app.use(koaProxy(key, {
        target: item.target,
        changeOrigin: item.changeOrigin,
        // agent: new httpsProxyAgent('http://1.2.3.4:88'), // if you need or just delete this line
        rewrite: item.pathRewrite,
        logs: logs
      }))
    }
  }
}