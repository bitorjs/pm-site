import {
  Controller,
  Get,
  Post
} from 'bitorjs-decorators';
// import Toast from '../../packages/Toast';

@Controller('/')
export default class {
  @Get('/:page?')
  async a(req) {
    let r = await this.ctx.$service.ff.aa();
    console.log(r)
    const data = this.ctx.$store.state.ttt.data;
    const asyncView = import(`../view/src/${req.params.page}`)
    asyncView.then(res => {
      let items = data.filter(item => {
        return item.name == req.params.page;
      })
      // this.ctx.Store.root.setItem("title", items[0].label);
      this.ctx.render(res.default)
    }).catch(res => {
      // Toast.fail('未找到页面')
      this.ctx.app.redirect('/')
    })
  }


}