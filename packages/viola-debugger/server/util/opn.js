const opn = require('opn')

const {
  isMacOS,
  isWin
} = require('./env')

function openChrome (url) {
  let chromeAppName = ''
  if (isMacOS) {
    chromeAppName = 'google chrome'
  } else if (isWin) {
    chromeAppName = 'chrome'
  } else {
    return Promise.reject('support MacOS and Windows only')
  }
  return opn(url, {
    app: chromeAppName
  })
}

module.exports = {
  openChrome
}