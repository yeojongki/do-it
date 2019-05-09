# reduce 实现 map filter 和数组扁平化

## 1. reduce 语法

> arr.reduce(callback[, initialValue])

## 2. map

### 2.1 map 语法

> var new_array = arr.map(function callback(currentValue[, index[, array]]) {
> // Return element for new_array
> }[, thisArg])

### 2.2 map 实现

思路：将每次遍历的元素，作为传入的函数的参数，并将函数执行的结果放入新的数组中。

```js
Array.prototype['myMap'] = function(callback) {
  return this.reduce((prev, currentValue, currentIndex, array) => {
    prev.push(callback(currentValue, currentIndex, array))
    return prev
  }, [])
}
```

## 3. filter

### 3.1 filter 语法

> var newArray = arr.filter(callback(element[, index[, array]])[, thisArg])

### 3.2 filter 实现

思路：和 map 类似，不同的是需要经过检验，才将遍历的当前元素放入数组中

```js
Array.prototype['myFilter'] = function(callback) {
  return this.reduce((prev, currentValue, currentIndex, array) => {
    callback(currentValue, currentIndex, array) && prev.push(currentValue)
    return prev
  }, [])
}
```

## 4. 数组扁平化

> 实现：[1,2,[3,4],[5,6,7]].myFlatten() // [1, 2, 3, 4, 5, 6, 7]

```js
Array.prototype.myFlatten = function() {
  return this.reduce((prev, currentValue, currentIndex, array) => {
    return prev.concat(currentValue)
  }, [])
}
```
