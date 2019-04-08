const express = require('express')
const router = express.Router();
const WebSocket = require('ws');
const {
  getTargetIdByPageId
} = require('../peers.js')

const log = require('../util/log')

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
