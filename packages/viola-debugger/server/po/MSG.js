const log = require('../util/log')

class MSG {
  constructor (msg) {
    if (typeof msg === 'string') {
      msg = JSON.parse(msg)
    }
    let {type, data} = msg
    this.type = type
    this.data = data
  }
  toJSON () {
    return {
      type: this.type,
      data: this.data
    }
  }
  toJSONString () {
    return JSON.stringify(this.toJSON())
  }

  is (type) {
    return new Promise((resolve, reject) => {
      if (this.type === type) {
        resolve(this.data)
      } else {
        reject()
      }
    })
  }

  static genMsg (type, data) {
    if (type && data) {
      return JSON.stringify({type, data})
    } else {
      log.title('MSG parse error: expect MSG { type, data }, but receive: ').error({type, data})
      // throw new TypeError('' + )
    }
  }

  static parse (msg) {
    try {
      msg = JSON.parse(msg)
    } catch (e) {
      log.title('MSG parse error').error(msg)
      throw new TypeError('MSG parse error: unexpect msg JSONString')
    }
    if (msg.type && msg.data) {
      return msg
    } else {
      throw new TypeError('MSG parse error: expect MSG { type, data }')
    }
  }
}

module.exports = MSG