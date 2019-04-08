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

const {
  genPeersByMap
} = require('./peers')

/**
 * 
 * @typedef ServerConfig
 * @property {[string]|string} [static]
 * @property {number} port
 * @property {[string]|string} targets 
 */

/**
 * 
 * @param {ServerConfig} config 
 */
function startServer (config) {
  var app = express()
  require('express-ws')(app)

  app.use(express.static(path.resolve(__dirname, '../static')))  

  // app.get('/', (req, res) => res.send('Viola Debug Server'))

  app.use('/', require('./router/page'))
  // app.use('/', require('./router/ws'))
  app.use('/channel', require('./router/channel'))
  app.use('/native', require('./router/native'))
  app.use('/devtool', require('./router/devtool'))
  
  const pageMap = genIdwithMap(Array.isArray(config.targets) ? config.targets : [config.targets])

  _config.debugger.set(config)

  app.listen(config.port, (e) => {
    if (e) {
      log.error(e)
    }
    log.info('pageMap', pageMap)
    console.log(boxen(`
    server listen at ${chalk.magenta(config.port)}
    `, {
      padding: 1
    }))

    let defaultChannel = new Channel({pageMap})
    config.autoOpen && defaultChannel.open()
  })
}

module.exports = {
  startServer
}