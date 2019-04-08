const {
  headlessConfig
} = require('../util/config')

const {
  getDevToolUrl,
  getDebugPageWSForDevTool,
  getDevtoolsWS
} = require('../util/frontEndPage')

const WebSocket = require('ws')

const EventEmitter = require('events');

const opn = require('opn')

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
    this.debugPageWS = getDebugPageWSForDevTool(this.targetId)
    // this.url = getDevToolUrl(this.debugPageWS)
    this.url = getDevToolUrl(getDevtoolsWS(peerId))
  }

  open () {
    opn(this.url, {
      app: 'google chrome'
    })
  }

  setupWS (ws) {
    // ws remote-url for debugPage
    const wsToHeadless = new WebSocket(`ws://${this.debugPageWS}`);
    let isConnecting = false
    wsToHeadless.on('open', function open() {
      console.log('connect to Headless')
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
      console.log('from Devtool', msg);
    });

    ws.on('close', () => {
      isConnecting = false
      wsToHeadless.close()
      this.emit(PAGE_EVENTS.CLOSE)
    })
  }
}

DevtoolPage.STATUS = PAGE_STATUS
DevtoolPage.EVENTS = PAGE_EVENTS

module.exports = DevtoolPage