const {
  getPageMap
} = require('./pageManager')

const config = require('./config').debugger

const ip = require('ip')

const os = require('os')

const platform = os.platform()

const isMacOS = platform === 'darwin'

const isWin = platform === 'win32'


function getIpAddr () {
  return ip.address()
}

function getEnvBaseInfo () {
  const _map = getPageMap()

  const _ip = getIpAddr(),
      addr = _ip + ':' + config.port

  let info = {
    ip: addr,
    debugJS: `http://${addr}/debug.js`,
    ws: `${addr}/native/`,
    pageMap: _map
  }

  return info
}

module.exports = {
  getEnvBaseInfo,
  getIpAddr,
  platform,
  isMacOS,
  isWin
}