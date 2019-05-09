import Dep from './dep';

export default class Observer {
  /**
   * 观察/挟持数据
   * @param {Object} data 传入的数据
   */
  constructor(data) {
    this.observe(data);
  }

  /**
   * 对数据原有的属性改成get和set的方式 必须是对象
   * @param {Object} data 传入的数据
   */
  observe(data) {
    if (!data || typeof data !== 'object') return;
    // 遍历数据进行挟持
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
      // 防止数据会有嵌套，递归深度处理 让每一个属性都带有get set {message:a:{b:1}}
      this.observe(data[key]);
    });
  }

  /**
   * 对数据进行响应式处理
   * @param {Object} obj 需要被观察的对象
   * @param {String} key 键
   * @param {String} value 值
   */
  defineReactive(obj, key, value) {
    const _this = this;
    let dep = new Dep(); // 每个变化的数据都会对应一个数组，这个数组是存放所有更新操作
    Object.defineProperty(obj, key, {
      enumerable: true,
      configable: true,
      get() { // 取值时调用的方法
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set(newVal) {// 设置值时调用的方法
        if (newVal !== value) {
          // 更改了新数据后，要重新挟持数据
          _this.observe(newVal);
          value = newVal;
          // 通知所有人数据更新了
          dep.notify();
        }
      }
    });
  }
}
