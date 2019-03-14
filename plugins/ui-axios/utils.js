/**
 * 防抖函数
 * @param method 事件触发的操作
 * @param delay 多少毫秒内连续触发事件，不会执行
 * @returns {Function}
 */
export function debounce(method,delay) {
  let timer = null;
  return function () {
      let self = this,
          args = arguments;
      timer && clearTimeout(timer);
      timer = setTimeout(function () {
          method.apply(self,args);
      },delay);
  }
}

/**
 * 节流函数
 * @param method 事件触发的操作
 * @param mustRunDelay 间隔多少毫秒需要触发一次事件
 */
export function throttle(method, mustRunDelay) {
  let timer,
      args = arguments,
      start;
  return function loop() {
      let self = this;
      let now = Date.now();
      if(!start){
          start = now;
      }
      if(timer){
          clearTimeout(timer);
      }
      if(now - start >= mustRunDelay){
          method.apply(self, args);
          start = now;
      }else {
          timer = setTimeout(function () {
              loop.apply(self, args);
          }, 50);
      }
  }
}