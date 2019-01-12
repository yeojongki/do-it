/**
 * 从vm.$data中获取值 $data[key] 多层嵌套获取值
 * @param {String} expr 表达式 message.a.b.c
 * @param {MVVM} vm 实例
 * @return {String}
 */
const getValFromVm = (expr, vm) => {
  return expr.split('.').reduce((prev, next) => prev[next], vm.$data);
};

export { getValFromVm };
