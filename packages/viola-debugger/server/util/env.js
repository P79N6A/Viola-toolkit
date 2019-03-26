const {
  getPageMap
} = require('./pageManager')

const config = require('./config').debugger

const ip = require('ip');

function getEnvBaseInfo () {
  const _map = getPageMap()

  const _ip = ip.address(),
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
  getEnvBaseInfo
}