var foo = {
  value: 'foo value'
};

function bar() {
  console.log(`func bar: value -> ${this.value}`);
}

// bar.call(foo); // 1

/**
 * 以上述例子说明call的用法
 * 1. 改变this指向, 指向到foo
 * 2. bar 函数执行
 */

/**
 * step 1 基本实现
 *
 * 试想当调用call的时候，把foo对象改造如下
 * var foo = {
 *   bar: function() {
 *     console.log(this.value)
 *   }
 * };
 * foo.bar(); // 1
 * 然后再删除bar属性
 *
 * 步骤如下：
 * 1. foo.bar = bar;
 * 2. foo.bar();
 * 3. delete foo.bar;
 */

Function.prototype.myCall = function(context) {
  // this -> function bar(){...}
  // context -> foo

  // 任意添加一个key值，并把当前函数赋值到context的这个任意key中
  context.fn = this;
  // 执行
  context.fn();
  // 删除这个key
  delete context.fn;
};

bar.myCall(foo);

/**
 * step2 call传参
 */
Function.prototype.myCall2 = function(context, ...args) {
  context.fn = this;

  context.fn(...args);

  delete context.fn;
};

var foo2 = {
  value: 'foo2 value'
};
var bar2 = function(name, age) {
  console.log(`func bar2: value -> ${this.value}, name -> ${name}, age -> ${age}`);
};

bar2.myCall2(foo2, 'jay', 18);

/**
 * step3 处理 this参数为不为object的情况，this指向全局对象global(node环境下)
 */
Function.prototype.myCall3 = function(context, ...args) {
  // 处理context
  if (typeof context === 'object') {
    context = context || global;
  } else {
    context = Object.create(null);
  }

  context.fn = this;

  context.fn(...args);

  delete context.fn;
};

// 设置一个global的value值
global.value = 'i am a global value';

var bar3 = function(name, age) {
  console.log(`func bar3: value -> ${this.value}, name -> ${name}, age -> ${age}`);
};
bar3.myCall3(null, 'jay', 18);

/**
 * step4 处理 context中如果key值如果已经存在的话会被覆盖, 另外函数添加返回值
 */
Function.prototype.myCall4 = function(context, ...args) {
  // 处理context
  if (typeof context === 'object') {
    context = context || global;
  } else {
    context = Object.create(null);
  }

  // es6 symbol处理唯一key
  let fn = Symbol('fn');
  context[fn] = this;

  let result = context[fn](...args);

  delete context[fn];

  // 返回值
  return result;
};

var bar4 = function(name, age) {
  console.log(`func bar4: value -> ${this.value}, name -> ${name}, age -> ${age}`);
  return `${name} ${age}`;
};
var foo4 = {
  value: 'foo4 value'
};
let bar4Result = bar4.myCall4(foo4, 'jay', 18);
console.log(`bar4Result -> ${bar4Result}`);
