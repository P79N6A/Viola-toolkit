const express = require('express')
const router = express.Router()
const log = require('../util/log')
// const fs = require('../util/config').debugger.fs

const {
  getPathById
} = require('../util/pageManager')

const DebugPeer = require('../po/DebugPeer')

router.get('/getBundle/:pageId', (req, res) => {
  let fs = require('../util/config').debugger.fs
  log.title('getBundle PageId').info(req.params.pageId)
  log.title('getBundle bundlePath').info(getPathById(req.params.pageId))
  const content = fs.readFileSync(getPathById(req.params.pageId), 'utf-8')
  res.send(content)
})

// testing
router.get('/getHistory/:peerId', (req, res) => {
  const peer = DebugPeer.getPeerById(req.params.peerId)
  const data = peer ? peer.historyTask : { error: 'NO PEER FOUND' }
  res.json(data)
})

// testing
router.get('/getHistory/:peerId/:type', (req, res) => {
  const peer = DebugPeer.getPeerById(req.params.peerId)
  const data = peer
                ? (peer.historyTask[req.params.type] || [])
                : { error: 'NO PEER FOUND' }
  res.json(data)
})

module.exports = router