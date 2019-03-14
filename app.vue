<template>
  <div>
    <header class="header">
      <nav class="inner">
       sdfsd
      </nav>
    </header>
    <transition name="fade" mode="out-in">
        <router-view></router-view>
    </transition>
  </div>
</template>
<script>
export default {
  nane: "StartPage",
  props: {
    title: { type: String, default: "所有组件" }, //,
    back: { type: Boolean, default: true } // false
  },
  methods: {
    onClickLeft() {
      // this.$bitor.store.root.setItem("title", "所有组件");
      this.ctx.app.redirect("/");
    }
  },
  watch: {
    "ctx.$store.state.title"(oldTitle, newTitle) {
      // document.title = newTitle;
    }
  }
};
</script>
<style lang="less">
.fade-enter-active, .fade-leave-active{
  transition: all .2s ease;
}
  
.fade-enter, .fade-leave-active{
  opacity: 0;
}
  
* {
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
html,
body {
  display: inline-block;
  width: 100%;
  // height: 100%;
  overflow-x: hidden;
}
div,
p,
center {
  box-sizing: border-box;
}
.header{
  box-shadow: 0 4px 13px -3px rgba(0, 0, 0, 0.10196);
  border-bottom: 1px solid #d2d2d2;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
}
</style>

