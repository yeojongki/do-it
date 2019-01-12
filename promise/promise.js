// Promise存在三个状态（state）pending、fulfilled、rejected
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

// 是否为函数
const isFunc = fn => typeof fn === 'function';

module.exports = class MyPromise {
  constructor(executor) {
    // 初始化state状态为等待
    this.status = PENDING;
    // 成功的值
    this.value = null;
    // 失败的原因
    this.reason = null;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    // resolve func
    const resolve = value => {
      if (this.status === PENDING) {
        // resolve调用后，state转化为成功态
        this.status = FULFILLED;
        // 储存成功的值
        this.value = value;
        // 一旦resolve执行，调用成功数组的函数
        this.onFulfilledCallbacks.forEach(fulfilledCallback => fulfilledCallback());
      }
    };

    // reject func
    const reject = reason => {
      if (this.status === PENDING) {
        // reject调用后，state转化为失败态
        this.status = REJECTED;
        // 储存失败的原因
        this.reason = reason;
        // 一旦reject执行，调用失败数组的函数
        this.onRejectedCallbacks.forEach(rejectedCallback => rejectedCallback());
      }
    };

    // executor可能会抛出异常，需要捕获
    try {
      // 将resolve和reject函数给使用者
      executor(resolve, reject);
    } catch (reason) {
      // 如果在函数中抛出异常则将它注入reject中
      reject(reason);
    }
  }

  /**
   * fulfilled状态/rejected状态对应的回调函数
   * @param  {function} onFulfilled fulfilled状态时 执行的函数
   * @param  {function} onRejected  rejected状态时 执行的函数
   * @return {function} promise2  返回一个新的promise对象
   */
  then(onFulfilled, onRejected) {
    // 处理参数默认值 保证参数后续能够继续执行
    onFulfilled = isFunc(onFulfilled) ? onFulfilled : value => value;
    // 抛出错误让catch方法捕获
    onRejected = isFunc(onRejected)
      ? onRejected
      : reason => {
          throw reason;
        };

    // then里面的FULFILLED/REJECTED状态时 为什么要加setTimeout ?
    // 原因:
    // 其一 2.2.4规范 要确保 onFulfilled 和 onRejected 方法异步执行(且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行) 所以要在resolve里加上setTimeout
    // 其二 2.2.6规范 对于一个promise，它的then方法可以调用多次.（当在其他程序中多次调用同一个promise的then时 由于之前状态已经为FULFILLED/REJECTED状态，则会走的下面逻辑),所以要确保为FULFILLED/REJECTED状态后 也要异步执行onFulfilled/onRejected

    // 其二 2.2.6规范 也是resolve函数里加setTimeout的原因
    // 总之都是 让then方法异步执行 也就是确保onFulfilled/onRejected异步执行

    // 如下面这种情景 多次调用p1.then
    // p1.then((value) => { // 此时p1.status 由pending状态 => fulfilled状态
    //     console.log(value); // resolve
    //     // console.log(p1.status); // fulfilled
    //     p1.then(value => { // 再次p1.then 这时已经为fulfilled状态 走的是fulfilled状态判断里的逻辑 所以我们也要确保判断里面onFuilled异步执行
    //         console.log(value); // 'resolve'
    //     });
    //     console.log('当前执行栈中同步代码');
    // })
    // console.log('全局执行栈中同步代码');
    //

    let promise2 = new MyPromise((resolve, reject) => {
      // 等待态
      if (this.status === PENDING) {
        this.onFulfilledCallbacks.push(() => {
          // promise的回调函数总是异步调用
          // promise是微任务，为了方便用宏任务setTimeout代替实现异步
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (reason) {
              reject(reason);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          // 异步
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (reason) {
              reject(reason);
            }
          }, 0);
        });
      }

      // 成功态
      if (this.status === FULFILLED) {
        // 异步
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        }, 0);
      }

      // 失败态
      if (this.status === REJECTED) {
        // 异步
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (reason) {
            reject(reason);
          }
        }, 0);
      }
    });

    return promise2;
  }

  /**
   * resolve中的值几种情况：
   * 1.普通值
   * 2.promise对象
   * 3.thenable对象/函数
   */

  /**
   * 对resolve 进行改造增强 针对resolve中不同值情况 进行处理
   * @param  {promise} promise2 promise1.then方法返回的新的promise对象
   * @param  {[type]} x         promise1中onFulfilled的返回值
   * @param  {[type]} resolve   promise2的resolve方法
   * @param  {[type]} reject    promise2的reject方法
   */
  resolvePromise(promise2, x, resolve, reject) {
    // promise2是上一个promise.then后返回的值，如果相同会导致下面的.then会是同一个promise2, 一直都是，没有尽头

    // let p = new Promise(resolve => {
    //   resolve(0);
    // });
    // var p2 = p.then(data => {
    //   // 循环引用，自己等待自己完成，一辈子完不成
    //   return p2;
    // })

    if (promise2 === x) {
      return reject(new TypeError('循环引用'));
    }

    // 防止多次调用
    let called;

    // x不是null 且x是对象或者函数
    if (x !== null && (typeof x === 'object' || isFunc(x))) {
      try {
        // A+规定，声明then = x的then方法
        const then = x.then;
        // 如果then是函数，就默认是promise了
        if (isFunc(then)) {
          // call它 因为then方法中的this来自自己的promise对象
          // 第一个参数是将x这个promise方法作为this指向，后两个参数分别为成功/失败回调
          then.call(
            x,
            y => {
              if (called) return; // 成功和失败只能调用一个
              called = true;
              // 递归，成功值y有可能还是promise或者是具有then方法等，再次resolvePromise，直到成功值为基本类型或者非thenable
              this.resolvePromise(promise2, y, resolve, reject);
            },
            reason => {
              if (called) return;
              called = true;
              reject(reason);
            }
          );
        } else {
          resolve(x);
        }
      } catch (reason) {
        // 也属于失败
        if (called) return;
        called = true;
        // 取then出错了就不继续执行了
        reject(reason);
      }
    } else {
      // x是普通值
      resolve(x);
    }
  }

  // catch
  catch(onRejected) {
    return this.then(null, onRejected);
  }
};
