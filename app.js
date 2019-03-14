import "normalize.css";
import Vue from 'vue';
import KoaAppliction from './inject';
import Start from './app.vue';
import { Select,Button,List, Icon } from 'ant-design-vue';
Vue.use(Select).use(Button).use(List).use(Icon);

// import path from 'path';
let client =  app => {

  app.watch(require.context("./config", true, /.*\.js$/));
  app.watch(require.context("./app", true, /.*\.js$/));

  
}

new KoaAppliction().start(client, Start);