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
  app.use('/', require('./router/ws'))
  app.use('/entry', require('./router/entry'))
  app.use('/native', require('./router/native'))
  
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
    config.open && defaultChannel.open()
    // genPeersByMap(pageMap)

    // opn(`http://127.0.0.1:${config.port}/entry.html`, {
    //   app: 'google chrome'
    // })
  })
}

module.exports = {
  startServer
}





// let count = 0

// let nativePeer = null
// let webPeer = null
// app.ws('/fromNative', function(ws, req) {
//   nativePeer = ws
//   console.log('from Native')
//   ws.on('message', function(msg) {
//     console.log('callJS', msg)
//     webPeer && webPeer.send(msg)
//   });
//   ws.on('close', () => {
//     console.log('close')
//   })
// });

// app.ws('/native', function(ws, req) {
//   webPeer = ws
//   ws.on('message', function(msg) {
//     console.log('callNative', msg)
//     nativePeer && nativePeer.send(msg)
//   });
//   ws.on('close', () => {
//     console.log('close')
//   })
// });

// app.ws('/debugger', function(ws, req) {
//   const wsToHeadless = new WebSocket('ws://localhost:9222/devtools/page/6A99386EE24A60D5C7E3913DF233C868');
//   let isConnecting = false
//   wsToHeadless.on('open', function open() {
//     console.log('connect to Headless')
//     isConnecting = true
//   });

//   wsToHeadless.on('message', function incoming(msg) {
//     ws.send(msg)
//   });

//   ws.on('message', function(msg) {
//     wsToHeadless.send(msg)
//     console.log('from Devtool', msg);
//   });

//   ws.on('close', () => {
//     isConnecting = false
//     wsToHeadless.close()
//   })
// });



// app.listen(port, () => console.log(`Example app listening on port ${port}!`))