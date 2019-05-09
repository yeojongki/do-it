import { getValFromVm } from '../util';
import Dep from './dep';

export default class Watcher {
  /**
   * 给需要变化的那个元素增加一个观察者 当数据变化后执行对应的方法
   * 思路： 用新值和原本的值对比 如果发生变化 就调用更新方法
   * @param {MVVM} vm 实例
   * @param {String} expr 表达式
   * @param {Function} callback 回调函数
   */
  constructor(vm, expr, callback) {
    this.vm = vm;
    this.expr = expr;
    this.callback = callback;
    // 先获取原来的值
    this.value = this.get();
  }
  get() {
    Dep.target = this;
    let value = getValFromVm(this.expr, this.vm);
    Dep.target = null;
    return value;
  }
  // 更新方法
  update() {
    let newVal = getValFromVm(this.expr, this.vm);
    let oldVal = this.value;
    if (newVal !== oldVal) {
      this.callback(newVal, oldVal);
    }
  }
}
