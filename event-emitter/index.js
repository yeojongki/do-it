const EventEmitter = require('./emitter');
const emitter = new EventEmitter();

const sayHandler = name => {
  console.log('Hello', name);
};

// 监听一个say事件
emitter.on('say', sayHandler);
// 再添加监听
emitter.on('say', function(name) {
  console.log('Hello2', name);
});

// 移除一个监听
emitter.off('say', sayHandler);

// 触发监听
emitter.emit('say', 'jay chou'); // Hello2 jay chou

// 移除所有的监听
emitter.removeAllListener('say');
emitter.emit('say', 'jay chou'); // 移除后为空

// addListener
emitter.addListener('eat', function(type) {
  console.log(`i am eating ${type}`);
});
emitter.emit('eat', 'fish'); // i am eating fish

// 获取所有的事件名
let eventNames = emitter.eventNames();
console.log(eventNames); // [ 'say', 'eat' ]
