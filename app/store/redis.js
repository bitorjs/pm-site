import redis from 'redis';


// // if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

// client.on("error", function (err) {
//   console.log("Error " + err);
// });

// client.set("string key", "string val", redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
// client.hkeys("hash key", function (err, replies) {
//   console.log(replies.length + " replies:");
//   replies.forEach(function (reply, i) {
//     console.log("    " + i + ": " + reply);
//   });
//   client.quit();
// });

export default (options={})=>{

  const client = redis.createClient(options);

  return async (ctx, next)=>{

    // 为 ctx 增加 log 方法
    Object.defineProperty(ctx, 'redis', {
      value: client,
      writable: false,
      enumerable: true,
      configurable: false
    });

    await next();
  }
}