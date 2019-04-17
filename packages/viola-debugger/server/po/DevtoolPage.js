// const {
//   headlessConfig
// } = require('../util/config')

const {
  getDevToolUrl,
  getDebugPageWSForDevTool,
  getDevtoolsWS
} = require('../util/frontEndPage')

const WebSocket = require('ws')

const EventEmitter = require('events');

const {
  openChrome
} = require('../util/opn')

const log = require('../util/log')

const PAGE_EVENTS = {
  CLOSE: 'close'
}

const PAGE_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECT: 'connect'
}

class DevtoolPage extends EventEmitter {
  constructor ({
    // ws,
    targetId,
    peerId
  }) {
    super()
    // this.ws = ws
    this.targetId = targetId
    this.peerId = peerId
    this.ws = null
    this.debugPageWS = getDebugPageWSForDevTool(this.targetId)
    // this.url = getDevToolUrl(this.debugPageWS)  // connect to TagertPage directlly
    this.url = getDevToolUrl(getDevtoolsWS(peerId)) // connect to NodeServer
  }

  open () {
    openChrome(this.url)
  }

  close () {
    this.ws.close()
  }

  setupWS (ws) {
    this.ws = ws
    // ws remote-url for debugPage
    const wsToHeadless = new WebSocket(`ws://${this.debugPageWS}`);
    let isConnecting = false
    wsToHeadless.on('open', function open() {
      log.title('connect to Headless').info()
      isConnecting = true
    });

    wsToHeadless.on('message', function incoming(msg) {
      ws.send(msg)
    });

    wsToHeadless.on('close', function headlessWSClose(msg) {
      ws.close()
    });
    
    /** @todo catch the msg and try to reuse it */
    ws.on('message', function(msg) {
      wsToHeadless.send(msg)
    });

    ws.on('close', () => {
      isConnecting = false
      wsToHeadless.close()
      this.emit(PAGE_EVENTS.CLOSE)
      this.ws = null
    })
  }
}

DevtoolPage.STATUS = PAGE_STATUS
DevtoolPage.EVENTS = PAGE_EVENTS

module.exports = DevtoolPage