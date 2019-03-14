import "normalize.css";
import KoaAppliction from './inject';
import Start from './app.vue';

// import path from 'path';
let client =  app => {

  app.watch(require.context("./config", true, /.*\.js$/));
  app.watch(require.context("./app", true, /.*\.js$/));

  
}

new KoaAppliction().start(client, Start);