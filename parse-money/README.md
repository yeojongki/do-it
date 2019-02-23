# 将数字格式化成金额的形式并四舍五入保留x位小数

## 一. 保留x位小数
tofix存在的问题： [JavaScript 浮点数陷阱及解法](https://github.com/camsong/blog/issues/9)

另外的办法：Math.round(X * 保留的位数) / 保留的位数
```js
/**
 * 将数字四舍五入保留x位小数
 * @param {Number|String} num 传入的数字
 * @param {Number} len 要保留的小数位 如2位小数
 * @return {String} result
 * @example handleTail(100.234, 2) -> 100.23
 */
const handleTail = (num, len) => {
   // 扩大相应倍数
  let scale = Math.pow(10, len)
   // 再缩小到原来的倍数
  return Math.round(+num * scale) / scale
}
```

## 二. 将数字格式化成金额的形式
```js
/**
 * 将数字格式化成金额的形式
 * @param {Number|String} num 传入的数字（必须是整数！！）
 * @return {String} result
 * @example thoudsandNum(123456) -> 123,456
 */
const thoudsandNum = num => {
  // 判断是否是正数
  let isPosive = true
  if (+num < 0) isPosive = false
  num = Math.abs(num)
  let prefix = isPosive ? '' : '-'
  // 正则相关 https://juejin.im/post/5965943ff265da6c30653879#heading-10
  let ret = ('' + num).replace(/(?!^)(?=(\d{3})+$)/g, ',')
  return prefix + ret
}
```

## 三. 分割小数整数部分最终合并
```js
const parseMoney = (num, len = 2) => {
  // 判断输入合法数字
  if (!/^-?\d+$|^(-?\d)+(\.)?\d+$/.test('' + num) || !/^\d+$/.test('' + len)) {
    throw new Error('invalid param `num` or `len`')
  }
  // 取出整数和小数部分
  let [head, tail] = (handleTail(num, len)).split('.')
  // 处理整数千分位
  head = thoudsandNum(head)
  return `${head}.${tail}`
}
```
另外还需要处理一些问题：没有小数，或者小数尾数不足的时候补0

## 完整版
```js
/**
 * 将数字格式化成金额的形式并四舍五入保留x位小数
 * @param {Number|String} num 传入的数字
 * @param {Number} len 要保留的小数位 (只能是正整数) 如2位小数
 * @return {String} result
 * @example parseMoney(-1234564.789) -> -1,234,564.79
 */
const parseMoney = (num, len = 2) => {
  // 判断输入合法数字
  if (!/^-?\d+$|^(-?\d)+(\.)?\d+$/.test('' + num) || !/^\d+$/.test('' + len)) {
    throw new Error('invalid param `num` or `len`')
  }
  // 扩大相应倍数
  let scale = Math.pow(10, len)
  // 再缩小到原来的倍数
  let scaleBack = Math.round(+num * scale) / scale
  // 取出整数和小数部分
  let [head, tail] = ('' + scaleBack).split('.')
  // 补零
  function fillZero(num) {
    let ret = num? num:''
    for(let i=1; i<len; i++) {
      ret+='0'
    }
    return ret
  }
  // 小数尾数补0
  tail = fillZero(tail)
  // 处理整数千分位
  // 处理正负数
  let isPosive = true
  if (+head < 0) isPosive = false
  head = ('' + Math.abs(head)).replace(/(?!^)(?=(\d{3})+$)/g, ',')
  // 正负号
  let prefix = isPosive ? '' : '-'
  return `${prefix}${head}.${tail}`
}

parseMoney(1234564.789) // 1,234,564.79
parseMoney(1234564.781) // 1,234,564.78
parseMoney(1234564.) // 1,234,564.00
parseMoney(-1234564) // -1,234,564.00
parseMoney(-1234564.6) // -1,234,564.60
parseMoney(-1234564.789) // -1,234,564.79
parseMoney(-1234564.6, 4) // -1,234,564.6000
```