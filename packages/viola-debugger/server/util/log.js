const chalk = require('chalk')

const logTypeStyle = {
  info: ['bgWhite', 'cyan'],
  error: ['bgRed', 'white'],
  warn: ['bgYellow', 'white'],
}

const LOG = {
  _title: '',
  title: function (title) {
    this._title = title
    return this
  }
}

function noop () {}

if (process.env.DEVELOPMENT) {
  function time () {
    console.log(`======== ${new Date()} =======`)
  }
  Object.keys(logTypeStyle).forEach((type) => {
    const style = logTypeStyle[type]
    LOG[type] = function (...msg) {
      time()
      let chalkStyleFnc = LOG[type]['_chalkStyle']
      if (!chalkStyleFnc) {
        const chalkStyle = style.reduce((fnc, s) => {
          return fnc[s]
        }, chalk)
        chalkStyleFnc = LOG[type]['_chalkStyle'] = chalkStyle
      }
      let _title = this._title || type.toUpperCase()
      console.log(chalkStyleFnc(` ${_title} `))
      console.log(...msg)
      console.log('')
      this._title = ''
    }
  });
} else {
  Object.keys(logTypeStyle).forEach((type) => {
    LOG[type] = noop
  });
}

module.exports = LOG