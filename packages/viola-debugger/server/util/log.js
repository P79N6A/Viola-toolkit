const chalk = require('chalk')

const logTypeStyle = {
  info: ['bgCyan', 'white'],
  error: ['bgRed', 'white'],
  warn: ['bgYellow', 'white'],
}

const levelTypes = Object.keys(logTypeStyle)

const levels = 
  process.env.DEVELOPMENT
    ? ['info', 'warn', 'error']
    : ['error']

let LOG = function LOG (...args) {
  console.log(...args)
  return this
}

LOG._title = ''
LOG.title = function (title) {
  this._title = title
  return this
}

function time () {
  console.log(`======== ${new Date()} =======`)
}

levels.forEach((type) => {
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
  levelTypes.splice(levelTypes.indexOf(type), 1)
});

function noop () {return this}
levelTypes.forEach((type) => {
  LOG[type] = noop
})

module.exports = LOG