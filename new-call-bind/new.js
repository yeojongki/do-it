/**
 * 当代码 new Foo(...) 执行时，会发生以下事情：
 *  1. 一个继承自 Foo.prototype 的新对象被创建。
 *  2. 使用指定的参数调用构造函数 Foo ，并将 this 绑定到新创建的对象。new Foo 等同于 new Foo()，也就是没有指定参数列表，Foo 不带任何参数调用的情况。
 *  3. 由构造函数返回的对象就是 new 表达式的结果。如果构造函数没有显式返回一个对象，则使用步骤1创建的对象。（一般情况下，构造函数不返回值，但是用户可以选择主动返回对象，来覆盖正常的对象创建步骤）
 *  tips: 构造函数不需要显示的返回值。使用new来创建对象(调用构造函数)时，如果return的是非对象(数字、字符串、布尔类型等)会忽而略返回值;如果return的是对象，则返回该对象。
 *  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new
 *
 *  简单来说
 *  1. 创建新对象
 *  2. 新对象隐式原型链接到函数原型(设置实例的constructor属性为构造函数的名称，并设置__proto__属性指向构造函数的prototype对象)
 *  3. 绑定this
 *  4. 返回新对象
 */

/**
 * Person构造函数
 * @param {String} name
 * @param {Number} age
 */
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.sayHello = function() {
    console.log('Hello,' + this.name);
  };
}

function myNew(P, ...args) {
  let o = {};
  o.__proto__ = P.prototype;
  // let o = Object.create(P.prototype) // or
  P.apply(o, args);
  return o;
}

let p1 = myNew(Person, 'yeojongki', 1);
let p2 = myNew(Person, 'jay', 2);
p1.sayHello(); // Hello,yeojongki
console.log(p1.__proto__ === Person.prototype); // true
console.log(p2.__proto__ === Person.prototype); // true
console.log(p1.__proto__ === p2.__proto__); // true
