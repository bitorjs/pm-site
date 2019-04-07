// Only support for ./services/DefaultUserService. If you use custom user service, ignore this file.
// call with:
// $ node ./bin/change_password.js 'username' 'new_password'
// curl -d "username=bitores&passwordhttp://localhost:1029/-/v1/change_passwd
var co = require('co');
var http = require('http');

var username = process.argv[2];
var newPassword = process.argv[3];

co(function* () {

  var data = {
    username: username,
    password: newPassword
  };
  data = require('querystring').stringify(data); //数据以url param格式发送
  var opt = {
    method: "POST",
    host: "localhost",
    port: 1029,
    path: "/-/v1/change_passwd",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      "Content-Length": data.length
    }
  };

  var req = http.request(opt, function (apacheRes) {//建立连接 和 响应回调
    if (apacheRes.statusCode == 200) {
      apacheRes.setEncoding('utf8');
      var body = "";
      apacheRes.on('data', function (recData) { body += recData; });
      apacheRes.on('end', function () {
        // apacheRes.send(body); 
        /*发送收到的响应*/
      });
    } else {
      // apacheRes.send(500, "error");
    }
  });
  req.write(data); //发送请求
  req.end(); //请求发送完毕

  // process.exit(0);
}).catch(function (e) {
  console.log(e);
});
