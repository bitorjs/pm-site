import {Service} from 'bitorjs-decorators';
import {mock} from 'mockjs';

@Service('ff')
export default class {
  constructor(ctx) {
    this.userList = this.createUserList();
  }

  createUserList() {
    return mock({
      // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
      'list|1-10': [{
        // 属性 id 是一个自增数，起始值为 1，每次增 1
        'id|+1': 1
      }]
    })
  }
  async aa() {
    return this.userList;
  }
}