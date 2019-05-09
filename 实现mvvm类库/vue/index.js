import MVVM from './core/mvvm';
window.vm = new MVVM({
  el: '#app',
  data: {
    message: {
      a: {
        b: 'this is a msg'
      }
    },
    otherMsg: 'this is an other msg',
    test: 'test content'
  }
});
