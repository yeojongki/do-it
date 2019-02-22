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
  let scale = Math.pow(10, len)  // 扩大相应倍数
  return Math.round(+num * scale) / scale // 再缩小到原来的倍数
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
  // 正则相关 https://juejin.im/post/5965943ff265da6c30653879#heading-10
  return (''+num).replace(/(?!^)(?=(\d{3})+$)/g, ',')
}
```

## 三. 分割小数整数部分最终合并
```js
const parseMoney = (num,len=2) => {
  if(!isNaN(num) || !isNaN(len)) throw new Error('invalid param `num` or `len`')
  let [head, tail] = (''+handleTail(num, len)).split('.') // 取出整数和小数部分
  head = thoudsandNum(head)
  return `${head}.${tail}`
}

parseMoney(1234564.789) // 1,234,564.79
parseMoney(1234564.781) // 1,234,564.78
parseMoney(1234564.) // Error: invalid param `num` or `len`
```
