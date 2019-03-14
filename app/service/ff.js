import {
  Service
} from 'bitorjs-decorators';
import axios from '../libs/axios';

@Service("ff")
export default class {
  async aa(){
    console.warn('09998')
    axios.get('/').then(res => {
      console.log(res)
    })
    const res = await axios.get('/');
    console.warn(res)
    return 'from service2-' + res;
  }

  async bb(){
    // this.ctx.db.query()
  }

}
