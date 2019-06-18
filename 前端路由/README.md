# spa 中的路由

## 1. hash 路由

### 1.1 介绍

- `hash` 路由的明显标志是带有 `#`，主要通过监听`url`中的`hash`变化进行路由跳转
- 优点：兼容性好
- 缺点：不美观

### 1.2 实现

#### 1.2.1 初始化路由

```js
class Router {
  constructor() {
    this.routes = {}
    this.currentUrl = ''
  }
}
```

#### 1.2.2 实现路由存储与执行

```js
class Router {
  constructor() {
    this.routes = {}
    this.currentUrl = ''
    this.currentIndex = -1
    this.history = []
    // 监听事件
    window.addEventListener('load', this.refresh, false)
    window.addEventListener('hashchange', this.refresh, false)
  }

  // 将 path 路径与对应的 callback 函数储存
  addRoute = (path, callback) => {
    this.routes[path] = callback || function() {}
  }

  // 将 path 路径与对应的 callback 函数储存
  refresh = () => {
    this.currentUrl = location.hash.slice(1) || '/'
    if (this.isBack) {
      this.history.pop(this.currentUrl)
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    } else {
      this.currentIndex++
      this.history.push(this.currentUrl)
    }
    this.routes[this.currentUrl]()
  }

  back = () => {
    this.isBack = true
    if (this.currentIndex <= 0) {
      this.currentIndex = 0
    } else {
      this.currentIndex -= 1
    }
    if (this.history.length) {
      const url = `${this.history[this.currentIndex]}`
      if (url) {
        location.hash = `#${url}`
        this.routes[url]()
      }
    }
  }
}
```

### 1.2.3 用法

可参考该目录下的`index.html`

```js
const router = new Router()
router.addRoute('/', () => {
  console.log(`path: root`)
})
router.addRoute('/test', () => {
  console.log(`path: test`)
})
```

## 2. history 路由

### 2.1 介绍

`history` 模式主要依靠 调用 `history.pushState()` 方法 和 监听 `popstate` 事件。

优点：没有`#`，看起来和普通页面跳转一样
缺点：只兼容 `ie10` 以上，除非后端或者服务器有做处理，否则会 `404`

常用`API`

```js
history.back() // 后退
history.forward() // 前进
history.go(-3) // 后退三个页面
history.pushState(state, title, url)
// state: 要传递的数据（参数）popstate 事件触发时，该对象会传入回调函数。
// title: 给页面设置的标题（兼容性差，几乎没用）
// url: 新的网址，必须与当前页面处在同一个域。浏览器的地址栏将显示这个网址
history.replaceState(state, title, url) // 参数同上
```

需要注意的是:

- 仅仅调用 `pushState` 方法或 `replaceState` 方法 ，并不会触发该事件
- 只有用户点击浏览器倒退按钮和前进按钮，或者使用 `JavaScript` 调用 `back、forward、go` 方法时才会触发。

```js
// example
history.pushState({ id: 1 }, '我是页面标题', url)

window.addEventListener('popstate', function(e) {
  // e.state 就是 pushState 的时候，传的第一个参数
  let state = e.state || {}
  //  根据参数 做一些其他操作
})
```

### 2.2 实现

```js
class Router {
  constructor() {
    this.routes = Object.create(null)
    window.addEventListener('popstate', function(e) {
      let state = e.state || {}
      let { path } = state
      console.log('path is', path)
    })
  }

  // 将 path 路径与对应的 callback 函数储存
  addRoute = (path, callback) => {
    this.routes[path] = callback || function() {}
  }

  // 跳转到某个路由
  go(path) {
    history.pushState({ path: path }, null, path)
    this.routes[path] && this.routes[path]()
  }
}
```
