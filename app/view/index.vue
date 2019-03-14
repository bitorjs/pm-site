<template>
  <div class="container">
    <center class="title">Build amazing things</center>
    <center class="desc">Essential JavaScript development tools that help you go to market faster and build powerful applications using modern open source code.</center>
  </div>
</template>
<script>

export default {
  name: "index",
  data () {
    return {
      
    }
  },
};
</script>
<style lang="less" scoped>
.container{
  padding: 5rem 0;
  .title{
    color: #000;
    font-size: 5rem;
    font-weight: bold;
    padding: 5rem 0 0;
  }
  .desc{
    font-size: 18px;
    padding: 5rem;
  }
}
@media only screen and (max-width: 767px) { 
  .title{
    color: #000;
    font-size: 2rem!important;
  }
  .desc{
    font-size: 18px;
    padding: 1rem!important;
  }
}
</style>
