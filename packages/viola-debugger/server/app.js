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
 */

/**
 * 
 * @param {ServerConfig} config 
 */
function startServer (config) {
  var app = express()
  require('express-ws')(app)

  app.use(express.static(path.resolve(__dirname, '../static')))

  app.use('/', require('./router/page'))
  app.use('/channel', require('./router/channel'))
  app.use('/native', require('./router/native'))
  app.use('/devtool', require('./router/devtool'))
  
  /** @todo  */
  const pageMap = genIdwithMap(Array.isArray(config.targets) ? config.targets : [config.targets])

  _config.debugger.set(config)

  app.listen(config.port, (e) => {
    if (e) {
      log.error(e)
      return
    }
    log.info('pageMap', pageMap)
    console.log(boxen(`
    server listen at ${chalk.magenta(config.port)}
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