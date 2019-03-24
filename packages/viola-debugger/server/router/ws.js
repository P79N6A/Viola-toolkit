const express = require('express')
const router = express.Router();
const WebSocket = require('ws');
const {
  getPeerByPageId,
  getTargetIdByPageId
} = require('../peers.js')

const log = require('../util/log')

const entryPage = []
const entryPageManager = require('../manager/entry')

const TYPES = {
  CALL_JS: 'callJS',
  LOGIN: 'login'
}

// for Native
/* router.ws('/native/:channelId', function(ws, req) {
  console.log('native: ', req.params.channelId)
  let channelId = req.params.channelId
  let peer = getPeerByPageId(pageId)
  if (peer) {
    peer.addDevice(ws)
    ws.on('message', function(msg) {
      // peer.notifyDevice(msg)
      // console.log('callJS to Page', msg)
      const { type, data } = JSON.parse(msg)
      switch (type) {
        case TYPES.CALL_JS:
          peer.notifyPage({
            type, data
          })
          break
        case TYPES.LOGIN:
          log.info(data)
          const { entryId, deviceInfo } = data
          if (entryPageManager.map[entryId]) {
            entryPageManager.map[entryId].send(JSON.stringify({
              type: 'addDevice',
              data: {
                pageId, deviceInfo
              }
            }))
          } else {
            log.error(Object.keys(entryPageManager.map))
          }
      }
    });
    ws.on('close', () => {
      console.log('close')
      peer.rmDevice(ws)
    })
  } else {
    log.error('Not found debugPage Peer')
  }
}); */

// for debugPage
router.ws('/debugPage/:pageId', function(ws, req) {
  let peer = getPeerByPageId(req.params.pageId)
  ws.on('message', function(msg) {
    peer.notifyDevice({
      msg,
      prefix: 'callNative'
    })
  });
  ws.on('close', () => {
    console.log('close')
  })
});

/**
 * A middle ws between devtoolUI and debugPage
 * @todo port targetId
 */
router.ws('/debugger/:pageId', function(ws, req) {
  let port = 9222
  let pageId = req.params.pageId
  let tId = getTargetIdByPageId(pageId)
  log.info('tID: ', tId)
  // ws remote-url for debugPage
  const wsToHeadless = new WebSocket(`ws://localhost:${port}/devtools/page/${tId}`);
  let isConnecting = false
  wsToHeadless.on('open', function open() {
    console.log('connect to Headless')
    isConnecting = true
  });

  wsToHeadless.on('message', function incoming(msg) {
    ws.send(msg)
  });
  
  /** @todo catch the msg and try to reuse it */
  ws.on('message', function(msg) {
    wsToHeadless.send(msg)
    console.log('from Devtool', msg);
  });

  ws.on('close', () => {
    isConnecting = false
    wsToHeadless.close()
  })
});

module.exports = router
