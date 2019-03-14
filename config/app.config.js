export default {
  port: 1029,
  env: 'production',// process.env.IS_DEV?"development":"production"
  mock: false,
  jwt:{
    secret: '',
    passthrough: '',
    expiresIn: '',
    token: '',
  },
  mysql:{
    DATABASE: 'xxx', //数据库名称
    USERNAME: 'xxx', //mysql用户名
    PASSWORD: 'xxx', //mysql密码
    PORT: '3306', //mysql端口号
    HOST: 'xx.xxx.xx.xx' //服务器ip
  }
}