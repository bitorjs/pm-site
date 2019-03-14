import "normalize.css";
import Vue from 'vue';
import KoaAppliction from './inject';
import Start from './app.vue';
import {Input, Select, AutoComplete,Button,List, Icon } from 'ant-design-vue';
Vue.use(Input).use(Select).use(AutoComplete).use(Button).use(List).use(Icon);

// import path from 'path';
let client =  app => {

  app.watch(require.context("./config", true, /.*\.js$/));
  app.watch(require.context("./app", true, /.*\.js$/));

  
}

new KoaAppliction().start(client, Start);