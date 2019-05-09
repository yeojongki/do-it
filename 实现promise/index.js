const myPromise = require('./promise');

// const testPromise = new myPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve('i am a test data');
//   }, 1500);
// });

// new myPromise((resolve, reject) => {
//   setTimeout(() => {
//     resolve('i am a setimeout data');
//   }, 1000);
// })
//   .then(res => {
//     console.log('resolve => ', res);
//     return testPromise;
//   })
//   .then(res2 => {
//     console.log('res2', res2);
//   });

// reject test
const rejectPromise = new myPromise((resolve, reject) => {
  setTimeout(() => {
    reject('i am a reject data');
  }, 1500);
});

rejectPromise
  .then(res => {
    console.log('value1 => ', res);
    return new myPromise((resolve, reject) => {
      reject('has error1');
    });
  })
  .then(
    res => {
      console.log('value2 => ', res);
      return new myPromise((resolve, reject) => {
        reject('has error2');
      });
    },
    err => {
      // 注意，这个then有onRejected的回调
      console.log('reason2 => ', err);
    }
  )
  .catch(err => {
    // 错误在上一个then被捕获了，所以不会走到这里
    console.error('catch err => ', err);
  });
