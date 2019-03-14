<template>
  <div class="header" :class="classes"><slot></slot></div>
</template>
<script>
export default {
  name: "Header",
  props: {
    border: Boolean
  },
  computed: {
    classes() {
      let classes = [];
      if (this.border) classes.push("border");

      return classes;
    }
  }
};
</script>
<style lang="less" scoped>
.header {
  width: 100%;
  height: 40px;
  background: white;
  text-align: center;
  font-size: 18px;
  line-height: 40px;

  &.border {
    border-bottom: 1px solid #f3f1f1;
  }
}
</style>
