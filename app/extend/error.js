export default app => {
  app.on('error', (err, ctx) => {
    ctx.log.info(err)
    try {
      // ctx.mail.send({
      //   from: '773155801@qq.com', // 发件地址
      //   to: 'huangzhengjie@dingtalk.com', // 收件列表
      //   subject: 'Hello sir', // 标题
      //   //text和html两者只支持一种
      //   text: 'Hello world ?', // 标题
      //   html: '<b>Hello world ?</b>' // html 内容
      // }, function(error, info){
      //   if(error){
      //     // return console.log(error);
      //     ctx.log.info(err)
      //   }
      //   console.log('Message sent: ' + info.response);
      // })
    } catch (error) {
      console.log('.....error...success',error)
    }
    
    // ctx.redis.set('key', 'value!', 'EX', 10);

    ctx.redis.hmset(["key", "test keys 1", "test val 1", "test keys 2", "test val 2"], function (err, res) {});

  });
}