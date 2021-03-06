const os = require('os');
const utility = require('utility');
const mkdirp = require('mkdirp');
const path = require('path');
const nfs = require('fs-cnpm');
const pkg = require('../package.json');


var version = pkg.version;

var root = path.dirname(__dirname);
var dataDir = path.join(process.env.HOME || root, '.cnpmjs.org');

const config = {
  port: 1029,
  env: 'production',// process.env.IS_DEV?"development":"production"
  mock: false,
  version: version,
  dataDir: dataDir,

  /**
   * Cluster mode
   */
  enableCluster: false,
  numCPUs: os.cpus().length,

  /*
   * server configure
   */

  registryPort: 7001,
  webPort: 7002,
  bindingHost: '127.0.0.1', // only binding on 127.0.0.1 for local access

  // debug mode
  // if in debug mode, some middleware like limit wont load
  // logger module will print to stdout
  debug: process.env.NODE_ENV === 'development',
  // page mode, enable on development env
  pagemock: process.env.NODE_ENV === 'development',
  // session secret
  sessionSecret: 'cnpmjs.org test session secret',
  // max request json body size
  jsonLimit: '10mb',
  // log dir name
  logdir: path.join(dataDir, 'logs'),
  // update file template dir
  uploadDir: path.join(dataDir, 'downloads'),
  // web page viewCache
  viewCache: false,

  // view files directory
  viewDir: path.join(root, 'view', 'web'),

  customRegistryMiddlewares: [],

  // config for koa-limit middleware
  // for limit download rates
  limit: {
    enable: true,
    token: 'koa-limit:download',
    limit: 1000,
    interval: 1000 * 60 * 60 * 24,
    whiteList: [],
    blackList: [],
    message: 'request frequency limited, any question, please contact fengmk2@gmail.com',
  },

  enableCompress: false, // enable gzip response or not

  // default system admins
  admins: {
    // name: email
    bitores: '773155801@qq.com',
    admin: 'huangzhengjie@dingtalk.org',
  },

  // email notification for errors
  // check https://github.com/andris9/Nodemailer for more informations
  mail: {
    enable: true,
    appname: 'cnpmjs.test',
    from: 'cnpmjs.org mail sender <adderss@gmail.com>',
    service: 'qq',
    port: 465,
    secureConnection: true, // 使用 SSL
    auth: {
      user: '773155801@qq.com',
      //这里密码不是qq密码，是你设置的smtp密码
      pass: 'htgmlubksnodbcid'
    }
  },

  // max handle number of package.json `dependencies` property
  maxDependencies: 200,
  // backup filepath prefix
  backupFilePrefix: '/cnpm/backup/',

  /**
   * database config
   */

  database: {
    db: 'cpm',
    username: 'root',
    password: 'root',

    // the sql dialect of the database
    // - currently supported: 'mysql', 'sqlite', 'postgres', 'mariadb'
    dialect: 'mysql',

    // custom host; default: 127.0.0.1
    host: 'localhost',

    // custom port; default: 3306
    port: 3306,

    // use pooling in order to reduce db connection overload and to increase speed
    // currently only for mysql and postgresql (since v1.5.0)
    pool: {
      maxConnections: 10,
      minConnections: 0,
      maxIdleTime: 30000
    },

    dialectOptions: {
      // if your server run on full cpu load, please set trace to false
      trace: true,
    },

    // the storage engine for 'sqlite'
    // default store into ~/.cnpmjs.org/data.sqlite
    // storage: path.join(dataDir, 'data.sqlite'),

    logging: !!process.env.SQL_DEBUG,
  },

  // package tarball store in local filesystem by default
  nfs: new nfs({
    dir: path.join(dataDir, 'nfs')
  }),
  // if set true, will 302 redirect to `nfs.url(dist.key)`
  downloadRedirectToNFS: false,

  // registry url name
  registryHost: 'localhost:1029',

  /**
   * registry mode config
   */

  // enable private mode or not
  // private mode: only admins can publish, other users just can sync package from source npm
  // public mode: all users can publish
  enablePrivate: false,

  // registry scopes, if don't set, means do not support scopes
  scopes: ['@cnpm', '@cnpmtest', '@html', '@bitores', '@wwr'],

  // some registry already have some private packages in global scope
  // but we want to treat them as scoped private packages,
  // so you can use this white list.
  privatePackages: [],

  /**
   * sync configs
   */

  // the official npm registry
  // cnpm wont directly sync from this one
  // but sometimes will request it for some package infomations
  // please don't change it if not necessary
  officialNpmRegistry: 'https://registry.npmjs.com',
  officialNpmReplicate: 'https://replicate.npmjs.com',

  // sync source, upstream registry
  // If you want to directly sync from official npm's registry
  // please drop them an email first
  sourceNpmRegistry: 'https://registry.npm.taobao.org',
  sourceNpmWeb: 'https://npm.taobao.org',

  // upstream registry is base on cnpm/cnpmjs.org or not
  // if your upstream is official npm registry, please turn it off
  sourceNpmRegistryIsCNpm: true,

  // if install return 404, try to sync from source registry
  syncByInstall: true,

  // sync mode select
  // none: do not sync any module, proxy all public modules from sourceNpmRegistry
  // exist: only sync exist modules
  // all: sync all modules
  syncModel: 'none', // 'none', 'all', 'exist'

  syncConcurrency: 1,
  // sync interval, default is 10 minutes
  syncInterval: '10m',

  // sync polular modules, default to false
  // because cnpm can't auto sync tag change for now
  // so we want to sync popular modules to ensure their tags
  syncPopular: false,
  syncPopularInterval: '1h',
  // top 100
  topPopular: 100,

  // sync devDependencies or not, default is false
  syncDevDependencies: false,
  // try to remove all deleted versions from original registry
  syncDeletedVersions: true,

  // changes streaming sync
  syncChangesStream: false,
  syncDownloadOptions: {
    // formatRedirectUrl: function (url, location)
  },
  handleSyncRegistry: 'http://127.0.0.1:7001',

  // default badge subject
  badgeSubject: 'cnpm',
  // defautl use https://badgen.net/
  badgeService: {
    url: function (subject, status, options) {
      options = options || {};
      let url = `https://badgen.net/badge/${utility.encodeURIComponent(subject)}/${utility.encodeURIComponent(status)}`;
      if (options.color) {
        url += `/${utility.encodeURIComponent(options.color)}`;
      }
      if (options.icon) {
        url += `?icon=${utility.encodeURIComponent(options.icon)}`;
      }
      return url;
    },
  },

  packagephobiaURL: 'https://packagephobia.now.sh',
  packagephobiaSupportPrivatePackage: false,

  // custom user service, @see https://github.com/cnpm/cnpmjs.org/wiki/Use-Your-Own-User-Authorization
  // when you not intend to ingegrate with your company's user system, then use null, it would
  // use the default cnpm user system
  userService: null,// default|github|other

  // always-auth https://docs.npmjs.com/misc/config#always-auth
  // Force npm to always require authentication when accessing the registry, even for GET requests.
  alwaysAuth: false,

  // if you're behind firewall, need to request through http proxy, please set this
  // e.g.: `httpProxy: 'http://proxy.mycompany.com:8080'`
  httpProxy: null,

  // snyk.io root url
  snykUrl: 'https://snyk.io',

  // https://github.com/cnpm/cnpmjs.org/issues/1149
  // if enable this option, must create module_abbreviated and package_readme table in database
  enableAbbreviatedMetadata: false,

  // global hook function: function* (envelope) {}
  // envelope format please see https://github.com/npm/registry/blob/master/docs/hooks/hooks-payload.md#payload
  globalHook: null,

  opensearch: {
    host: 'localhost:1029',
  },

  // redis cache
  redisCache: {
    enable: true,
    connectOptions: null,
  },

  logoURL: 'https://os.alipayobjects.com/rmsportal/oygxuIUkkrRccUz.jpg', // cnpm logo image url
  adBanner: '',
  customReadmeFile: '', // you can use your custom readme file instead the cnpm one
  customFooter: '', // you can add copyright and site total script html here
  npmClientName: 'cnpm', // use `${name} install package`
  packagePageContributorSearch: true, // package page contributor link to search, default is true
}

mkdirp.sync(config.logdir);
mkdirp.sync(config.uploadDir);

module.exports = config;
