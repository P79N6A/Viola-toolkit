const express = require('express')
const router = express.Router();

// const TYPES = {
//   ERROR: 'error',
//   LOGIN: 'login',
//   LOGIN_SUCC: 'LOGIN_SUCC',
//   ADD_DEVICE: 'addDevice',
//   RM_DEVICE: 'rmDevice',
//   ROUTE_TO: 'routeTo'
// }
const TYPES = require('../const/native')

const {
  getEnvBaseInfo
} = require('../util/env.js')

const log = require('../util/log')

const Channel = require('../po/Channel')

const entryPageManager = require('../manager/entry')

const config = require('../util/config').debugger

/**
 * Entry Page
 * @todo port targetId
 * @todo generate Channel if there is no channelId
 */
router.ws('/:channelId', function(ws, req) {
  console.log('native: ', req.params.channelId)
  let channelId = req.params.channelId
  const channel = Channel.getChannelById(channelId)
  if (channel) {
    ws.on('message', function(msg) {
      const { type, data } = JSON.parse(msg)
      switch (type) {
        case TYPES.CALL_JS:
          log.title('callJS').info(data)
          if (data.pageId && data.entryId) {
            channel.callJS({
              ws,
              pageId: data.pageId,
              entryId: data.entryId,
              task: data.task
            })
          }
          break
        case TYPES.LOGIN:
          log.info('login data', data)
          if (data.pageId && data.entryId) {
            channel.addDevice(ws, data)
          }
      }
    });
    ws.on('close', () => {
      console.log('close')
      // peer.rmDevice(ws)
    })
  } else {
    log.error('native WS Error: 找不到 channel', channelId)
    ws.close(404, 'no channel was found by ' + channelId)
  }
})

module.exports = router