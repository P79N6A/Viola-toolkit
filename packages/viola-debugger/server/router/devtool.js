const express = require('express')
const router = express.Router();
const DebugPeer = require('../po/DebugPeer')

const log = require('../util/log')

/**
 * A middle ws between devtoolUI and debugPage
 * @todo port targetId
 */
router.ws('/:peerId', function(ws, req) {
  /**
   * @todo get DevtoolPage by peerId, setup websockect with it
   */
  let peer = DebugPeer.getPeerById(req.params.peerId)
  if (peer) {
    peer.getDevtoolPage().setupWS(ws)
  } else {
    log.title('DEVTOOLS PEER NOT FOUND').error(req.params.peerId)
  }

});

module.exports = router
