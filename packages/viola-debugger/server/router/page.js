const express = require('express')
const router = express.Router()

// const fs = require('../util/config').debugger.fs

const {
  getPathById
} = require('../util/pageManager')

const DebugPeer = require('../po/DebugPeer')

router.get('/getBundle/:pageId', (req, res) => {
  let fs = require('../util/config').debugger.fs
  console.log(req.params.pageId)
  console.log(getPathById(req.params.pageId))
  console.log('fs', fs)
  const content = fs.readFileSync(getPathById(req.params.pageId), 'utf-8')
  res.send(content)
  // res.sendFile(getPathById(req.params.pageId))
  // res.send('xi xi ' + req.params.pageId)
})

// testing
router.get('/getHistory/:peerId', (req, res) => {
  console.log(req.params.peerId)
  const peer = DebugPeer.getPeerById(req.params.peerId)
  const data = peer ? peer.historyTask : { error: 'NO PEER FOUND' }
  res.json(data)
})

// testing
router.get('/getHistory/:peerId/:type', (req, res) => {
  console.log(req.params.peerId)
  const peer = DebugPeer.getPeerById(req.params.peerId)
  const data = peer
                ? (peer.historyTask[req.params.type] || [])
                : { error: 'NO PEER FOUND' }
  res.json(data)
})

module.exports = router