/**
 * bind()方法创建一个新的函数，在调用时设置this关键字为提供的值。
 * 并在调用新函数时，将给定参数列表作为原函数的参数序列的前若干项。
 */

let person = {
  name: 'yeojongki'
};

function say(age, text) {
  console.log(`name -> ${this.name}, age -> ${age}, text -> ${text}`);
}

let meFunc = say.bind(person, 7, 'me func');
meFunc(); // name -> yeojongki, age -> 7, text -> me func

/**
 * step1 改变this指向 并使之可以传参
 */
Function.prototype.myBind = function(context, ...args) {
  if (typeof this !== 'function') {
    throw new Error(`${this.name} is not a function`);
  }

  const self = this;
  // 返回的函数还可以继续传参
  return function(...args2) {
    return self.apply(context, args.concat(args2));
  };
};

let bind1Func = say.myBind(person, 7);
bind1Func('bind1 func'); // name -> yeojongki, age -> 7, text -> bind1 func

/**
 * step2 作为构造函数时
 * bind返回的函数如果作为构造函数，搭配new关键字出现的话，我们的绑定this就需要“被忽略”。
 */
Function.prototype.myBind2 = function(context, ...args) {
  if (typeof this !== 'function') {
    throw new Error(`${this.name} is not a function`);
  }

  // 空函数
  let noop = function() {};

  const self = this;
  let fBound = function(...args2) {
    // this instanceof fBound === true时,说明返回的fBound被当做new的构造函数调用 此时this -> fBound {}
    return self.apply(this instanceof fBound ? this : context, args.concat(args2));
  };

  // 维护原型关系
  if (this.prototype) {
    noop.prototype = this.prototype; // this -> function say(){...}  this.prototype -> {}
  }

  // 下行的代码使fBound.prototype是noop的实例,因此
  // 返回的fBound若作为new的构造函数,new生成的新对象作为this传入fBound,新对象的__proto__就是noop的实例
  fBound.prototype = new noop();

  return fBound;
};

let bind2Func = say.myBind2(person, 18);
new bind2Func('new bind2 func'); // name -> undefined, age -> 18, text -> new bind2 func  ** 构造函数时，传入的this被忽略 name为undefined **
bind2Func('bind2 func'); // name -> yeojongki, age -> 18, text -> bind2 func  ** 普通函数时 name是传入的对象的name **
