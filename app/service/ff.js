import {
  Service
} from 'bitorjs-decorators';

@Service('ff')
export default class {
  
  async aa() {
    // console.log(this.ctx.axios)
    console.warn('09998')
    this.ctx.$ajax.get('/user').then(res => {
      console.warn(res)
    })

    this.ctx.$ajax.post('/user').then(res => {
      console.warn(res)
    })

    const res = await this.ctx.$ajax.get('/');
    console.warn(res)
    return 'from service2-' + res;
  }
}