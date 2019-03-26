const express = require('express')
const router = express.Router()

const log = require('../util/log')
const Channel = require('../po/Channel')

router.ws('/:channelId', function(ws, req) {
  const channel = Channel.getChannelById(req.params.channelId)
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
  new Channel({ ws })
})

module.exports = router