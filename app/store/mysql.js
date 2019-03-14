import mysql from 'mysql';

export default (options={})=>{

  var connection = mysql.createConnection(Object.assign({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'mysql'
  },options));

  connection.connect();

  // connection.query('SELECT * from user', function (error, results, fields) {
  //   if (error) throw error;
  //   console.log('The solution is: ', results[0], fields);
  // });

  // connection.end();

  return async (ctx, next)=>{

     // 为 ctx 增加 log 方法
     Object.defineProperty(ctx, 'mysql', {
      value: connection,
      writable: false,
      enumerable: true,
      configurable: false
    });

    await next();

  }
}