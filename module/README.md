## 模块化加载学习

### 1. commonJS （同步的方式加载模块）

> 核心思想：通过`require`方法同步加载依赖的模块，通过 module.exports 导出暴露的接口

#### 1.1 用法

```js
// 导入
const moduleA = require('./moduleA');
// 导出
module.exports = `your code`;
```

#### 1.2 实现思路

- 假设文件夹下有一个 moduleA.js，先解析出绝对路径（路径可能没有后缀名 .js、.json）。

- 得到一个真实的加载路径。先去缓存中看一下这个文件是否存在，如果存在返回缓存中的模块 没有则创建一个模块。

#### 1.3 具体代码

`commonjs/index.js`

### 2. AMD （异步）

AMD 是"Asynchronous Module Definition"的缩写，意思就是"异步模块定义"。它采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。

### 2.1 用法

AMD 也采用 require()语句加载模块，但是不同于 CommonJS，它要求两个参数：

> require([module], callback);

```js
require(['moduleA', 'moduleB'], function(moduleA, moduleB) {
  // some code here
});
```
