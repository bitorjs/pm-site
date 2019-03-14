import Vue from 'vue'
import decorators from 'bitorjs-decorators';
import Application from 'bitorjs-application'
import Router from 'bitorjs-router';
import compose from 'koa-compose';
import directives from './directive';
import Vuex from './vuex';
import qs from "qs";
import HashMap from './hashmap';

const _filters = new Map();
const _services = new Map();
const _webstore = new Map();
const _middlewares = new Map();
const _modules = [];

const _componentHashMap = new HashMap();
const _filterHashMap = new HashMap();
const _middlewareHashMap = new HashMap();
const _serviceHashMap = new HashMap();
const _mockHashMap = new HashMap();
const _webstoreHashMap = new HashMap();
const _controllerHashMap = new HashMap();

const router = new Router();

export default class extends Application {
  constructor(options = {}) {
    super(options)
    console.info("实例化y应用程序")
    this.ctx.$config = {}
    this.$config = this.ctx.$config;

    this.mountVue();
    this.createDirectives(this, Vue);

    console.info("处理 路由查找中间件")
    this.use((ctx, next) => {
      const request = {};
      request.params = {}
      let arr = ctx.url.split('?')
      let routes = router.match(arr[0]);
      console.log(routes)
      let route = routes[0];
      if (route) {
        request.params = route.params;
        route.handle(request, next)
      }
    })

    this.beforeEach((to, from, next) => {
      let vn = this.$vue._upvn;
      if (vn && vn.$options && vn.$options.beforeRouteLeave) {
        vn.$options.beforeRouteLeave.call(vn, to, from, next)
      } else {
        next()
      }
    })
  }

  mountVue() {
    console.info("处理 vue 及 ctx上的渲染及虚拟请求方法")
    Vue.prototype.ctx = this.ctx;
    this.ctx.render = (webview, props) => {
      props = props || {}
      props.ref = 'innerPage';
      this.$vue.webview = webview;
      this.$vue.props = props;
      this.$vue.__update = 0;
    }
    decorators.methods.forEach((method) => {
      this.ctx[`$${method}`] = Vue.prototype[`$${method}`] = (url, params) => {

        const request = {};
        request.params = {}
        request.query = {}
        request.body = {}
        let urlParts = url.split("?")
        let routes = router.match(urlParts[0], method);
        console.log(routes)
        let route = routes[0];
        if (route && !route.params['0']) {
          request.params = route.params;
          
          if(urlParts[1]){
            request.query = Object.assign(request.query, qs.parse(urlParts[1]))
          }

          if(method === "get"){
            request.query = Object.assign(request.query, params);
          } else {// if(method === "post")
            request.body = Object.assign(request.body, params);
          }
          return route.handle(request)
        } else {
          return Promise.reject(`未找到路由[${url}]`);
        }
      }
    })
  }

  createVueRoot(vueRootComponent, htmlElementId) {
    console.info("挂载 vue 到 DOM")
    const innerPage = {
      name: 'router-view',
      render(h) {
        let vn = null;
        if (Object.prototype.toString.call(this.$root.webview) === '[object String]') {
          vn = h('span', this.$root.webview, {
            props: this.$root.props,
            ref: '_upvn'
          });
        } else {
          vn = h(this.$root.webview, {
            props: this.$root.props,
            ref: '_upvn'
          });
        }

        // console.log()
        this.$root._upvn = vn.context && vn.context.$refs._upvn;
        return vn;
      }
    }

    Vue.component(innerPage.name, innerPage);

    return new Vue({
      el: htmlElementId,
      data() {
        return {
          webview: null,
          props: null
        }
      },
      render: h => h(vueRootComponent ? vueRootComponent : innerPage)
    })
  }

  createDirectives(app, Vue) {
    console.info("处理 vue 路由指令")
    directives(app, Vue);
  }

  registerFilter(filename, filter) {
    if (_filters.get(filename) === undefined) {
      _filters.set(filename, filter)
      Vue.filter(filename, filter)
    } else {
      throw new Error(`Fliter [${filename}] has been declared`)
    }
  }

  registerService(filename, service) {
    const instance = new service(this.ctx);
    instance.ctx = this.ctx;
    let name = decorators.getService(service);
    if (name) {
      
      if (_services.has(name)) {
        throw new Error(`Service [${name}] has been declared`)
      } else { 
        _services.set(name, service)
        this.ctx.$service = this.ctx.$service || {};
        this.ctx.$service[name] = instance;
      }
    } else {
      if (_services.has(filename)) {
        throw new Error(`Service [${filename}] has been declared`)
      } else {
        _services.set(filename, service)
        this.ctx.$service = this.ctx.$service || {};
        this.ctx.$service[filename] = instance;
        console.warn('Service ', service, 'use @Service(name)')
      }
    }
  }


  registerController(filename, controller) {
    const instance = new controller(this.ctx)
    instance.ctx = this.ctx;

    let controllMiddlewares = decorators.getMiddleware(controller);
    controllMiddlewares = controllMiddlewares || [];
    controllMiddlewares.reverse();
    
    const preMiddlewares = [];
    for (let index = 0; index < controllMiddlewares.length; index++) {
      let middleware = controllMiddlewares[index];
      if(Object.prototype.toString.call(middleware)==="[object String]") {
        if(_middlewares.has(middleware)) preMiddlewares.push(_middlewares.get(middleware));
      } else {
        // 直接注入中间件函数
        preMiddlewares.push(middleware)
      }
    }
    decorators.iterator(controller, (prefix, subroute) => {
      let path;
      if (prefix.path && prefix.path.length > 1) {
        subroute.path = subroute.path === '/' ? '(/)?' : subroute.path;
        subroute.path = subroute.path === '*' ? '(.*)' : subroute.path;
        path = `${prefix.path}${subroute.path}`
      } else {
        path = `${subroute.path}`
      }

      console.log(path)

      let middlewares =decorators.getMiddleware(instance,subroute.prototype)
      middlewares = middlewares ||[];
      middlewares.reverse();

      if(middlewares.length>0||preMiddlewares.length>0) {
        let controllerMiddlewares = [].concat(preMiddlewares);
        for (let index = 0; index < middlewares.length; index++) {
          let middleware = middlewares[index];
          if(Object.prototype.toString.call(middleware)==="[object String]") {
            if(_middlewares.has(middleware)) controllerMiddlewares.push(_middlewares.get(middleware));
          } else {
            // 直接注入中间件函数
            controllerMiddlewares.push(middleware)
          }
        }

        controllerMiddlewares.push(
          instance[subroute.prototype].bind(instance)
        )

        const fn = compose(controllerMiddlewares);
        router.register(path, { method: subroute.method.toLowerCase()}, fn)
      } else {
        router.register(path, { method: subroute.method.toLowerCase() }, instance[subroute.prototype].bind(instance))
      }
    })
  }

  registerStore(name, store) {
    if (_webstore.get(name) === undefined) {
      _webstore.set(name, store)
      let vuxStore = new Vuex.Store(store, name);
      this.$store = vuxStore;
      this.ctx.$store = vuxStore;
    } else {
      throw new Error(`Store [${name}] has been declared`)
    }

  }

  registerMiddleware(filename, middleware) {
    if (_middlewares.get(filename)===undefined) {
      _middlewares.set(filename, middleware);
    } else {
      throw new Error(`Middleware [${filename}] has been declared`)
    }
  }

  registerComponent(filename, component) {
    if (!(component instanceof Object)) {
      throw new TypeError('Component must be Vue instance')
    }

    Vue.component(component.name||filename, component);
  }

  registerMainClient(mainClient) {
    console.info("挂载根插件")
    mainClient(this);
    this.emit("did-mainclient")
  }

  watch(requireContext) {
    console.info("分析收集插件目录")
    return requireContext.keys().map(key => {
      console.log(key)
      let m = requireContext(key);
      let c = m.default || m;
      let filename = key.replace(/(.*\/)*([^.]+).*/ig, "$2");
      if (key.match(/\/component\/.*\.vue$/) != null) {
        _componentHashMap.set(filename, c)
      } else if (key.match(/\/filter\/.*\.js$/) != null) {
        _filterHashMap.set(filename, c)
      } else if (key.match(/\/middleware\/.*\.js$/) != null) {
        _middlewareHashMap.set(filename, c)
      } else if (key.match(/\/controller\/.*\.js$/) != null) {
        _controllerHashMap.set(filename, c)
      } else if (key.match(/\/service\/.*\.js$/) != null) {
        _serviceHashMap.set(filename, c)
      } else if (key.match(/\/mock\/.*\.js$/) != null) {
        _mockHashMap.set(filename, c)
      } else if (key.match(/\/store\/.*\.js$/) != null) {
        _webstoreHashMap.set(filename, c)
      } else if (key.match(/\/plugin\.config\.js$/) != null) {
        c.forEach(item => {
          if (item.enable === true) _modules.push(item);
        })
      } else if (key.match(/\/development\.config\.js$/) != null) {
        if (this.$config.env === 'development') {
          this.$config = Object.assign(this.$config, c)
        }
      } else if (key.match(/\/production\.config\.js$/) != null) {
        if (this.$config.env === 'production') {
          this.$config = Object.assign(this.$config, c)
        }
      } else if (key.match(/\/app\.config\.js$/) != null) {
        this.$config = Object.assign(this.$config, c)
      }
    })
  }

  start(client, vueRootComponent, htmlElementId) {
    htmlElementId = htmlElementId || '#root';
    this.registerMainClient(client)

    console.info("挂载其它插件")
    _modules.forEach(m => {
      console.info("插件-", m.name)
      m.module(this, m)
    })
    this.emit('AppDidSetup')
    console.info("配置分析完成")
    console.info("注册所有全局组件")
    _componentHashMap.forEach((m, filename) => {
      this.registerComponent(filename, m);
    })
    console.info("注册所有过滤器")
    _filterHashMap.forEach((m, filename) => {
      this.registerFilter(filename, m);
    })
    console.info("注册所有存储服务")
    _webstoreHashMap.forEach((m, filename) => {
      this.registerStore(filename, m)
    })
    console.info("注册所有中间件")
    _middlewareHashMap.forEach((m, filename) => {
      this.registerMiddleware(filename, m);
    })
    console.info("注册所有实际请求服务")
    if(this.$config && this.$config.mock !== true) {
      _serviceHashMap.forEach((m, filename) => {
          this.registerService(filename, m)
        })
    } else {
      _mockHashMap.forEach((m, filename) => {
        this.registerService(filename, m)
      })
    }
    console.info("注册所有请求路由控制器")
    this.emit("ControllerWillMount")
    _controllerHashMap.forEach((m, filename)=>{
      this.registerController(filename, m)
    })
    this.emit("ControllerMounted")
    this.$vue = this.createVueRoot(vueRootComponent, htmlElementId)
    this.emit('ready');
    console.info("启动路由监听服务")
    this.startServer()
  }
}