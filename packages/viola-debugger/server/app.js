var express = require('express')
const path = require('path')

const boxen = require('boxen')
const chalk = require('chalk')

const log = require('./util/log');

const Channel = require('./po/Channel');

const _config = require('./util/config')

const {
  genIdwithMap
} = require('./util/pageManager')

/**
 * 
 * @typedef ServerConfig
 * @property {[string]|string} [static]
 * @property {number} [port] default: 8086
 * @property {string} [targetType] file & url, default: file
 * @property {[string]|string} targets 
 * @property {boolean} [autoOpen]
 * @property {boolean} [devtools] default: true
 * @property {FileSystem} [fs] default: NodeFileSystem 
 * @property {boolean} [watch] default: true
 */

/**
 * server config
 * @param {ServerConfig} config 
 */
function startServer (config) {
  var app = express()
  require('express-ws')(app)

  app.use(express.static(path.resolve(__dirname, '../static')))
  app.use('/', require('./router/page'))

  // why use app.ws
  // express-ws will add ws function to express.Router
  // but at it's source code,
  // "require('express')" which may cause that router.ws is not a function after publish
  // so use app.ws instead of router.ws here
  require('./router/channel')(app)
  require('./router/native')(app)
  require('./router/devtool')(app)
  
  /** @todo */
  const pageMap = genIdwithMap(Array.isArray(config.targets) ? config.targets : [config.targets])

  _config.debugger.set(config)
  
  const debuggerConfig = _config.debugger
  app.listen(debuggerConfig.port, (e) => {
    if (e) {
      log.error(e)
      return
    }
    log.info('pageMap', pageMap)
    
    console.log(boxen(`
    server listen at ${chalk.magenta(debuggerConfig.port)}
    scan QRCode in: ${chalk.magenta(`localhost:${debuggerConfig.port}/${debuggerConfig.FE.entryPage}`)}
    `, {
      padding: 1
    }))

    let defaultChannel = new Channel({pageMap})
    config.autoOpen && defaultChannel.open()
    app.defaultChannel = defaultChannel
  })

  return app
}

module.exports = {
  startServer
}