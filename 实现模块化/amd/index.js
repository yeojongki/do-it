let factories = {};

function define(moduleName, dependencies, factory) {
  factory.dependencies = dependencies; // 将模块的依赖存起来
  factories[moduleName] = factory;
}

function require(modules, callback) {
  let result = modules.map(module => {
    let factory = factories[module];
    let exports;
    let deps = factory.dependencies; // 比如是['name']

    // require(['name, age'], function(name, age){})
    require(deps, function() {
      exports = factory.apply(null, arguments);
    });

    return exports;
  });
  callback.apply(null, result);
}

// define声明模块 通过require使用模块
define('name', [], function() {
  return 'yeojongki';
});

define('age', ['name'], function(name) {
  return name + 7;
});

// test
require(['age'], function(nameAndAge) {
  console.log(nameAndAge);
});
