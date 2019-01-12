let factories = {};

function define(moduleName, dependencies, factory) {
  factories[moduleName] = factory;
}

function require(modules, callback) {
  let ret = modules.map(module => factories[module]()); // [yeojongki, 7]
  callback.apply(null, ret);
}

// define声明模块 通过require使用模块
define('name', [], function() {
  return 'yeojongki';
});
define('age', [], function() {
  return 7;
});

// test
require(['name', 'age'], function(name, age) {
  console.log(name, age);
});
