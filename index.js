import KoaAppliction from './inject';
const config = require('./config');
// import path from 'path';
let client = app => {
  app.config(config)
  // app.watch(require.context("./config", true, /.*\.js$/));
  app.watch(require.context("./app", true, /.*\.js$/));
}

new KoaAppliction().start(client, 1029);