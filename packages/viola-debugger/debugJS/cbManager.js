var PREFIX = '__VIOLA_DEBUG_JSFNC__'
var PREFIX_REG = /^__VIOLA_DEBUG_JSFNC__/
var cb = {}

viola.on('destroy', () => {
  cb = null
})

let _id = 1

function genFncId (fnc) {
  var id = PREFIX + (_id++)
  cb[id] = fnc
  return id
}

function isDebugJSFncId (fncName) {
  return PREFIX_REG.test(fncName)
}

function actFncById (fncName, data) {
  cb && cb[fncName] && cb[fncName](data)
}

module.exports = {
  genFncId,
  isDebugJSFncId,
  actFncById
}