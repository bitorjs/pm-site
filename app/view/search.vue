<template>
  <a-list
    itemLayout="vertical"
    size="large"
    :pagination="pagination"
    :dataSource="listData"
  >
    <div slot="header"><b>共搜索到 {{listData.length}}个包</b></div>
    <div slot="footer"><b>共搜索到 {{listData.length}}个包</b></div>
    <a-list-item slot="renderItem" slot-scope="item, index" key="item.title">
      <template slot="actions" v-for="{type, text} in actions">
        <span :key="type">
          <a-icon :type="type" style="margin-right: 8px" />
          {{text}}
        </span>
      </template>
      <a-list-item-meta
        :description="item.description"
      >
        <a class="title" slot="title" :href="item.href+item.title">{{item.title}}</a>
      </a-list-item-meta>
      <p >
        <a :href="`/#/search?q=${tag}`" class="tag" v-for="(tag, index) in tags" :key="index">{{tag}}</a>
      </p>
      <!--  -->
    </a-list-item>
  </a-list>
</template>
<script>
const listData = []
for (let i = 0; i < 23; i++) {
  listData.push({
    href: '/#/package?q=',
    title: `koa${i}`,
    description: 'Ant Design, a design language for background applications, is refined by Ant UED Team.',
    content: 'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
  })
}
export default {
  name: "search",
  data () {
    return {
      listData,
      pagination: {
        onChange: (page) => {
          console.log(page);
        },
        pageSize: 10,
        position: "both"
      },
      tags:["excel","xls","xlsx","xlsm","xlsb"],
      actions: [
        { type: 'star-o', text: '156' },
        { type: 'like-o', text: '156' },
        { type: 'message', text: '2' },
      ],
    }
  },
};
</script>
<style lang="less" scoped>
.title{
  color: rgba(0,0,0,.9);
  font-size: 18px;
  font-weight:600;
}
.tag{
  color: #5d5d5d;
  background-color: rgba(0,0,0,.1);
  margin-right: 10px;
  padding: 5px 10px;
  border-radius: 2px;
  font-size: 12px;
}

</style>
