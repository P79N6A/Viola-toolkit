const express = require('express')
const router = express.Router();

const TYPES = {
  ERROR: 'error',
  LOGIN: 'login',
  LOGIN_SUCC: 'LOGIN_SUCC',
  ADD_DEVICE: 'addDevice',
  RM_DEVICE: 'rmDevice',
  ROUTE_TO: 'routeTo'
}

const {
  getEnvBaseInfo
} = require('../util/env.js')

const log = require('../util/log')
const Channel = require('../po/Channel')

router.get('/env', function(req, res) {
  // ws remote-url for debugPage
  const env = getEnvBaseInfo()
  res.send(env)
})
/**
 * Entry Page
 * @todo port targetId
 * @todo generate Channel if there is no channelId
 */
router.ws('/', function(ws, req) {
  let channel = null, entryPage = null
  ws.on('message', function(msg) {
    const { type, data } = JSON.parse(msg)
    log.info('message: ', {type, data})
    switch (type) {
      case TYPES.LOGIN:
        log.info('Entry Page Come in: ', data)
        if (data.channelId) {
          channel = Channel.getChannelById(data.channelId)
          entryPage = channel.addEntryPage(ws)
          const env = getEnvBaseInfo()
          ws.send(JSON.stringify({
            type: TYPES.LOGIN_SUCC,
            data: {
              entryId: entryPage.id,
              env
            }
          }))
        } else {
          log.error('login error: Miss channel_id')
          ws.send(JSON.stringify({
            type: TYPES.ERROR,
            data: {
              errorMsg: 'login error: Miss channel_id'
            }
          }))
        }
        break
      case TYPES.ROUTE_TO:
        log.info('route to: ', data.pageId)
    }
  });

  ws.on('close', () => {
    log.info('Entry Page Close')
    // channel && entryPage && (channel.rmEntryPage(entryPage))
  })
})

module.exports = router