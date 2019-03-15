<template>
  <div>
    <header class="header">
      <center>
        <div class="logo">
          <svg viewBox="0 0 780 250"><path fill="#231F20" d="M240,250h100v-50h100V0H240V250z M340,50h50v100h-50V50z M480,0v200h100V50h50v150h50V50h50v150h50V0H480z M0,200h100V50h50v150h50V0H0V200z"></path></svg>
        </div>
        <nav class="search-inner">
          <a-auto-complete
            class="global-search"
            size="large"
            style="width: 100%"
            :allowClear="true"
            @select="onSelect"
            @search="handleSearch"
            placeholder="search"
            optionLabelProp="text"
          >
            <template slot="dataSource">
              <a-select-option v-for="item in dataSource" :key="item.category" :text="item.category">
                {{item.query}} 在
                <a
                  :href="`/#/search?q=${item.query}`"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{item.category}}
                </a>
              </a-select-option>
            </template>
            <a-input>
              <a-button slot="suffix" class="search-btn" size="large">
                Search
              </a-button>
            </a-input>
          </a-auto-complete>
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
  data() {
    return {
      dataSource: [],
    }
  },
  methods: {
    onSelect(value) {
      console.log('onSelect', value);
    },

    handleSearch(value) {
      this.dataSource = value ? this.searchResult(value) : []
      window.location.hash = '/search?q='+value;
    },

    getRandomInt(max, min = 0) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    searchResult(query) {
      return (new Array(this.getRandomInt(5))).join('.').split('.')
        .map((item, idx) => ({
          query,
          category: `${query}${idx}`,
          count: this.getRandomInt(200, 100),
        }));
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
    display: inline-block;
    width: 100px;
    height: 16px;
    padding: 5px 16px;
  }
  .search-inner{
    display: inline-block;
    vertical-align: text-bottom;
    height: 40px;
    width: 50%;
  }
}

.content{
  margin-top: 55px;
  background: #f6f6f6;
  min-height: 100vh;
  .inner-content{
    max-width: 80%;
    margin: 0 auto;
    background: white;
    // padding: 1rem;
  }
}

@media only screen and (max-width: 767px) { 
  .search-inner{
    width: 100%!important;
  }
  .logo{
    height: 33px!important;
    display: block!important;
  }
  .header{
    height: 95px;
  }

  .content {
    margin-top: 90px!important;
  }
}

.global-search-wrapper {
  padding-right: 50px;
}

.global-search.ant-select-auto-complete .ant-input-affix-wrapper .ant-input:not(:last-child) {
  padding-right: 62px;
}

.global-search.ant-select-auto-complete .ant-input-affix-wrapper .ant-input-suffix {
  right: 0;
}

.global-search.ant-select-auto-complete .ant-input-affix-wrapper .ant-input-suffix button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.ant-select-selection__clear{
  right: 100px;
}

.global-search-item-count {
  position: absolute;
  right: 16px;
}
</style>

