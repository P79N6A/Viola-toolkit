const log = require('../util/log')

const {
  multipleChannel
} = require('../util/config').debugger

const Channel = require('../po/Channel')

const PATH = '/channel'

module.exports = function setupRouter (app) {
  app.ws(`${PATH}/:channelId`, function(ws, req) {
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
  app.ws(`${PATH}/`, function(ws) {
    if (!multipleChannel) {
      channel = req.app.defaultChannel
      channel.setupWS(ws)
    } else {
      new Channel({ ws })
    }
  })
}