const os = require('os')

/**
 * 获取 ip 地址
 */
function getIp () {
  const interfaces = os.networkInterfaces()
  let ip = '',
    isBreak = false
  for(var i in interfaces){
    interfaces[i].some(x => {
      if((x.family == 'IPv4') && (x.internal == false)){
        ip = x.address
        isBreak = true
        return true
      } 
    })
    if(isBreak) break
  }
  return ip
}

module.exports = {
  getIp
}