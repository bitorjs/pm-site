<template>
  <div>
    <header class="header">
      <center>
        <nav class="search-inner">
          <a-select class="search" mode="combobox" placeholder="asdfasd" :tokenSeparators="[',']" @change="handleChange">
              <a-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">{{(i + 9).toString(36) + i}}</a-select-option>
            </a-select>
            <a-button class="button">Search</a-button>
          </nav>
      </center>
      
    </header>
    <div class="content">
      <transition name="fade" mode="out-in">
          <router-view class="inner-content"></router-view>
      </transition>
    </div>
  </div>
</template>
<script>
export default {
  nane: "StartPage",
  props: {
    
  },
  methods: {
    handleChange(value) {
      console.log(`selected ${value}`);
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
  overflow-x: hidden;
}
div,
p,
center {
  box-sizing: border-box;
}
.header{
  background: white;
  box-shadow: 0 4px 13px -3px rgba(0, 0, 0, 0.10196);
  border-bottom: 1px solid #d2d2d2;
  position: fixed;
  z-index: 999;
  height: 55px;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px 1rem 0;
  .logo{
    width: 100px;
    height: 40px;
  }
  .search-inner{
    height: 40px;
    // font-size: 0;
    // width: 50%;

    .search{
      height: 100%;
      width: calc(100% - 100px);
    }

    .button{
      width: 100px;
      vertical-align: top;
      font-size: 14px;
      float: right;
    }
  }
}

.content{
  margin-top: 55px;
  background: #cccccc;
  max-height: 100vh;
  .inner-content{
    max-width: 80%;
    margin: 0 auto;
    background: white;
    padding: 1rem;
  }
}

@media screen and (max-width: 767px) { 
  .search-inner{
    width: 100%;
  }
}

@media screen and (min-width: 768px) { 
  .search-inner{
    width: 50%;
  }
}

</style>

