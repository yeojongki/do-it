class EventEmitter {
  constructor() {
    this._events = {};
  }

  /**
   * 返回当前订阅的事件名集合
   */
  eventNames() {
    return Object.keys(this._events);
  }

  /**
   * 监听事件
   * @param {String} eventName 事件名
   * @param {Function} listener 执行的函数
   */
  on(eventName, listener) {
    // `listener` 必须是函数
    if (typeof listener !== 'function') {
      throw new Error(`The "listener" argument must be of type Function.`);
    }

    if (this._events[eventName]) {
      this._events[eventName].push(listener);
    } else {
      // 事件队列不存在
      this._events[eventName] = [listener];
    }
  }

  /**
   * 同`on`方法
   * @param {String} eventName 事件名
   * @param {Function} listener 执行的函数
   */
  addListener(eventName, listener) {
    this.on(eventName, listener);
  }

  /**
   * 触发事件
   * @param {String} eventName 事件名
   * @param  {...any} args 传入的参数
   */
  emit(eventName, ...args) {
    if (!this._events[eventName]) return;

    this._events[eventName].forEach(listener => {
      listener.apply(this, args);
    });
  }

  /**
   * 移除某个事件下的某个执行函数
   * @param {String} eventName
   * @param {Function} listener
   */
  off(eventName, listener) {
    if (!this._events[eventName]) return;
    this._events[eventName] = this._events[eventName].filter(handler => handler !== listener);
  }

  /**
   * 移除某个事件下的所有执行函数
   * @param {*} eventName
   */
  removeAllListener(eventName) {
    this._events[eventName] && (this._events[eventName] = []);
  }
}

module.exports = EventEmitter;
