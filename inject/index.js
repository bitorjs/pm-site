import Koa from 'koa';
import KoaRouter from 'koa-router';
import decorators from 'bitorjs-decorators';
import compose from 'koa-compose';
import HashMap from './hashmap';
import qs from "qs";

const router = new KoaRouter();

// 自动注册 中间件
const appExtends = [];

const _modules = [];
const _services = new Map();
const _middlewares = new Map();

const _middlewareHashMap = new HashMap();
const _controllerHashMap = new HashMap();
const _serviceHashMap = new HashMap();
const _mockHashMap = new HashMap();

export default class extends Koa {

  constructor() {
    super()
    console.log("挂载 App 至 global对象")
    global.context = this.context;
    console.info("App 应用实例化")
    this.context.$config = {}
    this.$config = this.context.$config;

    decorators.methods.forEach((method) => {
      this.context[`$${method}`] = (url, params) => {

        const request = {};
        request.params = {}
        request.query = {}
        request.body = {}
        let urlParts = url.split("?")
        let routes = router.match(urlParts[0], method);
        console.log(routes, this)
        let route = routes.path[0];
        if (route) {
          //   request.params = route.params;

          if (urlParts[1]) {
            request.query = Object.assign(request.query, qs.parse(urlParts[1]))
          }

          if (method === "get") {
            request.query = Object.assign(request.query, params);
          } else {//if(method === "post")
            request.body = Object.assign(request.body, params);
          }
          return route.stack[0](this.context)
        } else {
          return Promise.reject(`未找到路由[${url}]`);
        }
      }
    })
  }

  registerMiddleware(filename, middleware) {
    if (_middlewares.has(filename) === false) {
      _middlewares.set(filename, middleware);
    } else {
      throw new Error(`Middleware [${filename}] has been declared`)
    }
  }

  registerService(filename, allService) {
    let serviceName = undefined;
    const defaultService = allService.default;
    if (defaultService) {
      // console.log(allService, defaultService)
      let instance;
      try {
        instance = new defaultService(this.context);
      } catch (error) {
        console.log(defaultService, error)
      } finally {
        // console.log(defaultService.constructor)
      }
      instance.ctx = this.context;
      let name = decorators.getService(defaultService);
      if (name) {
        serviceName = name;
        if (_services.has(serviceName)) {
          throw new Error(`Service [${serviceName}] has been declared`)
        }
      } else {
        serviceName = filename;
        if (_services.has(serviceName)) {
          throw new Error(`Service [${serviceName}] has been declared`)
        } else {
          console.warn('Service ', serviceName, 'use @Service(name)')
        }
      }

      _services.set(serviceName, defaultService)
      this.context.$service = this.context.$service || {};
      this.context.$service[serviceName] = instance;
    }

    delete allService.default;
    let extraServices = Object.keys(allService);
    if (extraServices.length > 0) {
      if (serviceName === undefined) {
        this.context.$service[serviceName] = {};
      }
      extraServices.forEach(key => {
        let extraService = allService[key];
        extraService.bind(this.context);
        this.context.$service[serviceName][key] = extraService;
      })
    }
  }

  registerController(filename, controller) {
    const instance = new controller(this);
    instance.ctx = this.context;

    let controllMiddlewares = decorators.getMiddleware(controller);
    controllMiddlewares = controllMiddlewares || [];
    controllMiddlewares.reverse();

    const preMiddlewares = [];
    for (let index = 0; index < controllMiddlewares.length; index++) {
      let middleware = controllMiddlewares[index];
      if (Object.prototype.toString.call(middleware) === "[object String]") {

        if (_middlewares.has(middleware)) preMiddlewares.push(_middlewares.get(middleware));
      } else {
        // 直接注入中间件函数
        preMiddlewares.push(middleware)
      }
    }

    decorators.iterator(controller, (prefix, subroute) => {
      let path;
      if (prefix.path && prefix.path.length > 1) { //:   prefix='/'
        subroute.path = subroute.path === '/' ? '(/)?' : subroute.path;
        subroute.path = subroute.path === '*' ? '(.*)' : subroute.path;
        path = `${prefix.path}${subroute.path}`
      } else {
        path = `${subroute.path}`
      }
      console.log(path)
      let middlewares = decorators.getMiddleware(instance, subroute.prototype)
      middlewares = middlewares || [];
      middlewares.reverse();

      if (middlewares.length > 0 || preMiddlewares.length > 0) {
        let controllerMiddlewares = [].concat(preMiddlewares);
        for (let index = 0; index < middlewares.length; index++) {
          let middleware = middlewares[index];
          if (Object.prototype.toString.call(middleware) === "[object String]") {
            if (_middlewares.has(middleware)) controllerMiddlewares.push(_middlewares.get(middleware));
          } else {
            // 直接注入中间件函数
            controllerMiddlewares.push(middleware)
          }
        }

        controllerMiddlewares.push(
          instance[subroute.prototype].bind(instance)
        )

        const fn = compose(controllerMiddlewares);
        router[subroute.method.toLowerCase()](path, fn)
      } else {
        router[subroute.method.toLowerCase()](path, instance[subroute.prototype].bind(instance))
      }
    })
  }

  registerMainClient(mainClient) {
    console.info("挂载根插件")
    mainClient(this);
    this.emit("did-mainclient")
  }

  watch(requireContext) {
    requireContext.keys().map(key => {
      console.log(key)
      let m = requireContext(key);
      m = m.default || m;
      let filename = key.replace(/(.*\/)*([^.]+).*/ig, "$2");

      if (key.match(/\/controller.*\.js$/)) {
        _controllerHashMap.set(filename, m)
      } else if (key.match(/\/middleware\/.*\.js$/)) {
        _middlewareHashMap.set(filename, m)
      } else if (key.match(/\/extend\/.*\.js$/)) {
        appExtends.push(m)
      } else if (key.match(/\/service\/.*\.js$/) != null) {
        const allService = requireContext(key);
        _serviceHashMap.set(filename, allService)
      } else if (key.match(/\/mock\/.*\.js$/) != null) {
        const allService = requireContext(key);
        _mockHashMap.set(filename, allService)
      } else if (key.match(/\/plugin\.config\.js$/) != null) {
        m.forEach(item => {
          if (item.enable === true) _modules.push(item);
        })
      } else if (key.match(/\/development\.config\.js$/) != null) {
        if (this.$config.env === 'development') {
          this.$config = Object.assign(this.$config, m)
        }
      } else if (key.match(/\/production\.config\.js$/) != null) {
        if (this.$config.env === 'production') {
          this.$config = Object.assign(this.$config, m)
        }
      } else if (key.match(/\/app\.config\.js$/) != null) {
        this.$config = Object.assign(this.$config, m)
      }
    })
  }

  config(config) {
    this.$config = Object.assign(this.$config, config)
  }

  start(client, port = 1029) {

    this.registerMainClient(client)

    console.info("挂载其它插件")
    _modules.forEach(m => {
      console.info("插件-", m.name)
      m.module(this, m)
    })

    console.info("注册所有中间件")
    _middlewareHashMap.forEach((m, filename) => {
      this.registerMiddleware(filename, m);
    })

    console.info("注册所有实际请求服务")
    if (this.$config && this.$config.mock !== true) {
      _serviceHashMap.forEach((m, filename) => {
        this.registerService(filename, m);
      })
    } else {
      _mockHashMap.forEach((m, filename) => {
        this.registerService(filename, m)
      })
    }

    console.info("应用前置中间件")
    appExtends.map(ex => {
      ex(this)
    })

    console.info("注册路由")
    _controllerHashMap.forEach((m, filename) => {
      this.registerController(filename, m)
    })
    this.use(router.routes())

    console.info("启动监听服务")
    this.listen(port, () => {
      console.log(`server is running at http://localhost:${port}`)
    });

    return this;
  }

}