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

const debuggerConfig = new Config({
  port: 8086,
  targets: null,
  open: true,
  FE: {
    debugPage: 'debug.html',
    entryPage: 'entry.html'
  }
})

const headlessConfig = new Config({
  port: 9222
})

module.exports = {
  debugger: debuggerConfig,
  headless: headlessConfig
}