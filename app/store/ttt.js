export default {
  state: {
    count: 0,
    data: [{
      name: 'nginx',
      label: 'Nginx 配置'
    }, {
      name: 'loading',
      label: '加载'
    }, {
      name: 'life',
      label: '强制更新'
    }, {
      name: 'pop-up',
      label: 'Popup'
    }, {
      name: 'scroll-header',
      label: '滚动Header'
    }, {
      name: 'up-down',
      label: 'up-down'
    }, {
      name: 'swipe',
      label: '轮播图'
    }, {
      name: 'uploader',
      label: '上传'
    }, {
      name: 'icon',
      label: '图标'
    }, {
      name: 'button',
      label: '按钮'
    }, {
      name: 'layout',
      label: '布局'
    }, {
      name: 'cell',
      label: 'Cell'
    }, {
      name: 'navbar',
      label: 'navbar'
    }, {
      name: 'dialog',
      label: '弹框'
    }, {
      name: 'toast',
      label: 'Toast'
    }, {
      name: 'sketeton',
      label: '骨架'
    }, {
      name: 'action-sheet',
      label: 'ActionSheet'
    }, {
      name: 'waterfall',
      label: '瀑布流'
    }]
  },
  getters: {
    a: state => {

    },
    b: state => {

    }
  },
  mutations: {
    increment(state, payload) {
      state.count++;
      console.warn(state.count)
    }
  },
  actions: {
    increment(context) {
      context.commit('increment')
    }
  }
}