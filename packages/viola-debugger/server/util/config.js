class Config {
  constructor (config = Object.create(null)) {
    this._keys = Object.keys(config)
    this._keys.forEach(k => {
      this[k] = config[k]
    })
  }
  set (...args) {
    const _set = (key, value) => {
      this._keys.includes(key) && (this[key] = value)
    }

    const p = args[0]
    if (Object.prototype.toString.call(p) === '[object Object]') {
      Object.keys(p).forEach(key => {
        _set(key, p[key])
      })
    } else if (typeof args[1] !== 'undefined') {
      _set(p, args[1])
    }
    return this
  }
}

const defaultFS = require('fs')

const debuggerConfig = new Config({
  fs: defaultFS,
  port: 8086,
  targets: null,
  targetType: 'file', // bundle 链接类型
  devtools: true,   // 显示 devtools
  autoOpen: true,   // 自动打开页面
  chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',   // 预留，如果使用 puppeteer-core
  multipleChannel: true,
  FE: {
    debugPage: 'debug.html',
    entryPage: 'entry.html',
    devtool: 'front_end/inspector.html'
  }
})

const headlessConfig = new Config({
  port: 9222
})

module.exports = {
  debugger: debuggerConfig,
  headless: headlessConfig
}