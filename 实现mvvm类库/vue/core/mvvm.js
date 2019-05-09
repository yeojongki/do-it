import Observer from './observer';
import Compile from './compile';

export default class MVVM {
  /**
   * mvvm
   * @param {Object} opts 传入的选项
   */
  constructor(opts) {
    this.$el = opts.el;
    this.$data = opts.data;
    // 如果有元素，则挟持数据并进行编译
    if (this.$el) {
      new Observer(this.$data);
      // 代理数据 vm.message 代理到 vm.$data.message
      this.proxyData(this.$data);
      new Compile(this.$el, this);
    }
  }
  /**
   * 数据代理
   * @param {Object} data 需要被代理的数据
   */
  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key];
        },
        set(newVal) {
          if (newVal !== data[key]) {
            data[key] = newVal;
          }
        }
      });
    });
  }
}
