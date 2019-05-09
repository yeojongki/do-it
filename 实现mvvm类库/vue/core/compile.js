import Watcher from './watcher';
import { getValFromVm } from '../util';

export default class Compile {
  /**
   * 编译
   * @param {HTMLElement} el 根节点
   * @param {MVVM} vm 实例
   */
  constructor(el, vm) {
    this.$el = this.isElementNode(el) ? this.$el : document.querySelector(el);
    this.vm = vm;
    // 有这个根元素才去编译
    if (this.$el) {
      // 1. 先把真实dom取出来放到内存中
      let fragment = this.node2Fragment(this.$el);
      // 2. 编译 提取想要的的元素节点 如v-model="message" 文本节点 {{message}}
      this.compile(fragment);
      // 3. 把编译好的fragment放回到dom里
      this.$el.appendChild(fragment);
    }
  }

  /**
   * 编译文档碎片
   * @param {DocumentFragment} fragment 需要编译的文档碎片
   */
  compile(fragment) {
    let childNodes = fragment.childNodes;
    [...childNodes].forEach(node => {
      // 编译元素节点
      if (this.isElementNode(node)) {
        // 编译元素
        this.compileElement(node);
        // 递归获取元素中的元素节点
        this.compile(node);
      } else if (this.isTextNode(node)) {
        // 编译文本节点
        this.compileText(node);
      }
    });
  }

  /**
   * 编译元素 如v-model v-text
   * @param {HTMLElement} node 需要编译的元素节点
   */
  compileElement(node) {
    let attrs = node.attributes; // 这是一个NamedNodeMap
    [...attrs].forEach(attr => {
      let attrName = attr.name;
      // 判断是否带有v-属性开头的属性
      if (attrName.includes('v-')) {
        let attrType = attrName.slice(2); // 如v-model => model
        // 取对应的值放到节点中
        let expr = attr.value; // 如v-model="message" => message
        // 编译带指令元素
        CompileUtil[attrType](expr, node, this.vm);
      }
    });
  }

  /**
   * 编译文本 {{text}}
   * @param {HTMLElement} node 需要编译的节点
   */
  compileText(node) {
    // 节点的值 可能是`{{message}} {{otherMsg}} text`多个表达式
    let expr = node.textContent;
    const reg = /\{\{[^}]+\}\}/g;
    // 如果有表达式 {{}}
    if (reg.test(expr)) {
      CompileUtil['text'](expr, node, this.vm);
    }
  }

  /**
   * 把元素中的节点放到内存中
   * @param {HTMLElement} el 传入的元素
   * @return {DocumentFragment} fragment
   */
  node2Fragment(el) {
    let fragment = document.createDocumentFragment();
    [...el.childNodes].forEach(node => {
      fragment.appendChild(node);
    });
    return fragment;
  }

  /**
   * 判断是否是元素节点
   * @param {Node} node 传入的节点
   */
  isElementNode(node) {
    return node.nodeType === 1;
  }

  /**
   * 判断是否是文本节点
   * @param {Node} node 传入的节点
   */
  isTextNode(node) {
    return node.nodeType === 3;
  }
}

const CompileUtil = {
  /**
   * 从vm.$data中获取值 $data[key] 多层嵌套获取值
   * @param {String} expr 表达式 message.a.b.c
   * @param {MVVM} vm 实例
   * @return {String}
   */
  getVal(expr, vm) {
    return getValFromVm(expr, vm);
  },
  /**
   * 从vm.$data中获取值（文本节点内容） $data[key]
   * @param {String} expr 表达式 {{message.a.b.c}}
   * @param {MVVM} vm 实例
   */
  getTextVal(expr, vm) {
    const _this = this;
    return expr.replace(/\{\{([^}]+)\}\}/g, function() {
      return _this.getVal(arguments[1].trim(), vm);
    });
  },
  /**
   * 文本处理 去除大括号 获取data中的值并更新 {{message.a.b}} {{otherMsg}}
   * @param {String} expr 表达式
   * @param {HTMLElement} node 元素节点
   * @param {MVVM} vm 实例
   */
  text(expr, node, vm) {
    const _this = this;
    let updateFn = this.updater['textUpdater'];
    // {{a}} {{b}} 既要观察a也要观察b
    expr.replace(/\{\{([^}]+)\}\}/g, function() {
      new Watcher(vm, arguments[1].trim(), () => {
        // 如果数据变化了，文本需要重新获取依赖的属性更新文本中的内容
        updateFn && updateFn(node, _this.getTextVal(expr, vm));
      });
    });
    updateFn && updateFn(node, this.getTextVal(expr, vm));
  },
  /**
   * 从vm.$data中找到表达式并将输入框的值设为`value`
   * @param {String} expr 表达式
   * @param {MVVM} vm 实例
   * @param {String} value 值
   */
  setInputVal(expr, vm, value) {
    expr = expr.split('.');
    return expr.reduce((prev, next, currentIndex) => {
      if (currentIndex === expr.length - 1) {
        return (prev[next] = value);
      }
      return prev[next];
    }, vm.$data);
  },
  /**
   * 输入框处理 v-model
   * @param {String} expr 表达式
   * @param {HTMLElement} node 元素节点
   * @param {MVVM} vm 实例
   */
  model(expr, node, vm) {
    let updateFn = this.updater['modelUpdater'];
    // 添加监控 当数据变化了 调用这个watcher的callback
    new Watcher(vm, expr, () => {
      // 当值变化后会调用callback，将新的值传递过来
      updateFn && updateFn(node, this.getVal(expr.trim(), vm));
    });
    node.addEventListener('input', e => {
      let newVal = e.target.value;
      this.setInputVal(expr, vm, newVal);
    });
    updateFn && updateFn(node, this.getVal(expr.trim(), vm));
  },
  updater: {
    /**
     * 输入框更新函数
     * @param {HTMLElement} node 元素节点
     * @param {String} val 值
     */
    modelUpdater(node, val) {
      node.value = val;
    },
    /**
     * 文本更新函数
     * @param {HTMLElement} node 元素节点
     * @param {String} val 值
     */
    textUpdater(node, val) {
      node.textContent = val;
    }
  }
};
