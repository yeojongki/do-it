# 理解 setInterval

## 一、setInterval 弊端

1.  `setInterval` 无视代码错误
    `setInterval` 有个讨厌的习惯，即对自己调用的代码是否报错这件事漠不关心。换句话说，如果 `setInterval` 执行的代码由于某种原因出了错，它还会持续不断（不管不顾）地调用该代码。

    ```js
    setInterval(() => {
      console.log(a.b)
    }, 1000)
    ```

2.  `setInterval` 不保证执行
    与 setTimeout 不同，如果你调用的函数需要花很长时间才能完成，那么你并不能保证到了时间间隔，代码就准能执行。

    ```js
    // 开始时间
    let start = +new Date()
    // 第几次执行
    let times = 0
    // timer id
    let tid

    // for sleep
    function sleep(sleepTime) {
      const start = +new Date()
      while (true) {
        if (+new Date() - start > sleepTime) {
          return
        }
      }
    }

    async function log() {
      times++
      const nowTimes = times
      let timeDiff = +new Date() - start
      console.log(`start-${nowTimes}`, `${timeDiff}ms`)
      await sleep(1000)
      if (times === 3) {
        clearInterval(tid)
        return
      }
    }

    tid = setInterval(log, 500)

    /*
     * logs
     * start-1 1003ms
     * start-2 2004ms
     * start-3 3007ms
     */
    ```

    可以看到第一次和第二次之间相差了 `1000ms`，不符合我们设定的间隔时间 `500ms`

3.  `setInterval` 无视网络延迟
    假设你每隔一段时间就通过 `Ajax` 轮询一次服务器，看看有没有新数据（注意：如果你真的这么做了，那恐怕你做错了；建议使用“补偿性轮询” `backoff polling`）。而由于某些原因（服务器过载、临时断网、流量剧增、用户带宽受限，等等），你的请求要花的时间远比你想象的要长。但 `setInterval` 不在乎。它仍然会按定时持续不断地触发请求，最终你的客户端网络队列会塞满 `Ajax` 调用。

## 二、解决方法：setTimeout

与其使用 `setInterval`，不如在适当的时刻通过 `setTimeout` 来调用函数自身。

```js
let tid
function mySetInterval(callback, delay) {
  tid = setTimeout(() => {
    callback()
    mySetInterval(callback, delay)
  }, delay)
}

function myClearInterval() {
  clearTimeout(tid)
}
```

> tips：改用使用模拟的`setInterval`可以解决第一、二个问题

这样做的好处是：在前一个定时器代码执行完成之前，不会向队列插入新的定时代码，确保不会有任何的缺失间隔。而且，它保证在下一次定时器代码执行之前，至少要等待指定的时间间隔。

## 三、如果必须保证间隔相等怎么办？

如果确实要保证事件“匀速”被触发，那可以用希望的延迟减去上次调用所花时间，然后将得到的差值作为延迟动态指定给 `setTimeout`。 不过，要注意的是 `JavaScript` 的计时器并不是非常精确。因此你不可能得到绝对“平均”的延迟，即使使用 `setInterval` 也不行，原因很多（比如垃圾回收、`JavaScript` 是单线程的，等等）。此外，当前浏览器也会将最小的超时时间固定在 4ms 到 15ms 之间。因此不要指望一点误差也没有。
