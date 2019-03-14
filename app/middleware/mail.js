import nodemailer from 'nodemailer';

export default (options={})=>{
  const transporter = nodemailer.createTransport(Object.assign({
    //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
    service: 'qq',
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {
        user: '773155801@qq.com',
        //这里密码不是qq密码，是你设置的smtp密码
        pass: 'htgmlubksnodbcid'
    }
}, options));

  // NB! No need to recreate the transporter object. You can use
  // the same transporter object for all e-mails

  // setup e-mail data with unicode symbols
  // var mailOptions = {
  //     from: '773155801@qq.com', // 发件地址
  //     to: '528779822@qq.com', // 收件列表
  //     subject: 'Hello sir', // 标题
  //     //text和html两者只支持一种
  //     text: 'Hello world ?', // 标题
  //     html: '<b>Hello world ?</b>' // html 内容
  // };

  // // send mail with defined transport object
  // transporter.sendMail(mailOptions, function(error, info){
  //   if(error){
  //     return console.log(error);
  //   }
  //   console.log('Message sent: ' + info.response);
  // });

  let mail = {}
  mail.send = function(options, callback){
    transporter.sendMail(options, callback)
  }
  return async (ctx, next)=>{

    // 为 ctx 增加 log 方法
    Object.defineProperty(ctx, 'mail', {
      value: mail,
      writable: false,
      enumerable: true,
      configurable: false
    });

    await next();
  }

} 