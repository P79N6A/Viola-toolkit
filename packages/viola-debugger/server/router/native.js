const express = require('express')
const router = express.Router();

const TYPES = require('../const/native')

const log = require('../util/log')

const DebugPeer = require('../po/DebugPeer')

/**
 * Entry Page
 * @todo port targetId
 * @todo generate Channel if there is no channelId
 */
router.ws('/:peerId', function(ws, req) {
  log.title('native: ', req.params.peerId).info()
  let peerId = req.params.peerId
  const peer = DebugPeer.getPeerById(peerId)
  peer && peer.setupWS(ws)
})

module.exports = router