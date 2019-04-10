const express = require('express')
const router = express.Router()

const log = require('../util/log')
const {
  multipleChannel
} = require('../util/config').debugger
const Channel = require('../po/Channel')

router.ws('/:channelId', function(ws, req) {
  let channel
  if (!multipleChannel) {
    channel = req.app.defaultChannel
  } else {
    channel = Channel.getChannelById(req.params.channelId)
  }
  if (channel && !channel.hasWS()) {
    channel.setupWS(ws)
  } else {
    log.title('channelId NOT FOUND').error({
      channelId: req.params.channelId
    })
  }
})
/**
 * Entry Page
 * @todo port targetId
 * @todo generate Channel if there is no channelId
 */
router.ws('/', function(ws) {
  if (!multipleChannel) {
    channel = req.app.defaultChannel
    channel.setupWS(ws)
  } else {
    // channel = Channel.getChannelById(req.params.channelId)
    new Channel({ ws })
  }
})

module.exports = router