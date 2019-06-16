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
    // 监听事件
    window.addEventListener('load', this.refresh, false)
    window.addEventListener('hashChanged', this.refresh, false)
  }

  // 将 path 路径与对应的 callback 函数储存
  route(path, callback) {
    this.routes[path] = callback || function() {}
  }

  refresh() {
    this.currentUrl = location.hash.slice(1) || '/'
    this.routes[this.currentUrl]()
  }
}
```

## history 路由
