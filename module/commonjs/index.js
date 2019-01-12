const fs = require('fs');
const path = require('path');
const PrefixDir = 'commonjs'; // 当前目录

/**
 * 处理文件后缀
 */
const handleFileExt = {
  '.js': module => {
    // 获取js文件内容
    let script = fs.readFileSync(module.id, 'utf8');
    let fn = new Function(
      'exports',
      'module',
      'require',
      '__dirname',
      '__filename',
      script + '\n return module.exports;'
    );

    return fn(module.exports, module, req, __dirname);
    /**
     * function(exports, module, require, __dirname, __filename) {
     *  module.exports = content;
     *  return module.exports;
     * }
     */
  },
  '.json': module => {
    // 将读取出来的内容json parse即可
    try {
      return JSON.parse(fs.readFileSync(module.id, 'utf8'));
    } catch (error) {
      console.error('JSON parse error', error);
    }
  }
};

/**
 * 内置的后缀, 当没有文件后缀时候尝试添加的后缀
 */
const _extensions = ['.js', '.json'];

/**
 * 缓存的模块
 */
const _cacheModule = {};

/**
 * 模块类
 */
class Module {
  /**
   * 处理绝对路径
   * @param {String} filepath 模块路径
   */
  static _resolveFilename(filepath) {
    // 模块的完整路径
    const resolvePath = path.resolve(PrefixDir, filepath);
    // 判断是否含有后缀名
    if (!/\.\w+$/.test(resolvePath)) {
      // 创建规范规定查找文件后缀名顺序的数组 .js .json
      let arr = Object.values(_extensions);

      // 循环查找
      for (let i = 0; i < arr.length; i++) {
        // 将绝对路径与后缀名进行拼接
        let file = resolvePath + arr[i];
        // 查找不到文件时捕获异常
        try {
          // 并通过 fs 模块同步查找文件属性，文件未找到会直接进入 catch 语句
          fs.statSync(file);

          // 如果找到文件将该文件绝对路径返回
          return file;
        } catch (e) {
          // 当后缀名循环完毕都没有找到对应文件时，抛出异常
          if (i >= arr.length) throw new Error('can not found module');
        }
      }
    } else {
      // 有后缀名直接返回该绝对路径
      return resolvePath;
    }
  }

  /**
   * 模块构造函数
   * @param {String} id 模块名
   */
  constructor(id) {
    // module的id 即模块的全路径地址
    this.id = id;

    // module.exports
    this.exports = {};

    // module 是否加载完成
    this.loaded = false;
  }

  load() {
    // 判断加载的文件是什么后缀名
    let ext = path.extname(this.id);

    // 根据不同的后缀名处理文件内容，参数是当前实例
    let content = handleFileExt[ext](this);

    // 将处理后的结果返回
    return content;
  }
}

/**
 * 根据模块路径加载模块
 * @param {String} path 模块路径
 */
const req = path => {
  // 获取绝对路径
  let filepath = Module._resolveFilename(path);

  // 如果模块已经在缓存中则直接返回
  if (_cacheModule[filepath]) {
    console.log('命中缓存 => ', filepath);
    return _cacheModule[filepath].exports;
  }

  // 生成模块
  let module = new Module(filepath);

  // 加载模块
  let content = module.load(filepath);

  // 将加载后返回的内容赋值给模块实例的 exports 属性上
  module.exports = content;

  // 加载完成
  module.loaded = true;

  // 添加进缓存
  _cacheModule[filepath] = module;

  // 最后返回 模块实例的 exports 属性，即加载模块的内容
  return module.exports;
};

// test
const moduleA = req('./moduleA');
const moduleB = req('./moduleA.js');
const moduleC = req('./module');
console.log('moduleA =>', moduleA);
console.log('moduleB =>', moduleB);
console.log('moduleC =>', moduleC);
