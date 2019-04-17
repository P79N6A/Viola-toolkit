const log = require('../util/log')

const DebugPeer = require('../po/DebugPeer')

const PATH = '/native'

module.exports = function setupRouter (app) {
  /**
   * Entry Page
   * @todo port targetId
   * @todo generate Channel if there is no channelId
   */
  app.ws(`${PATH}/:peerId`, function(ws, req) {
    log.title('native: ', req.params.peerId).info()
    let peerId = req.params.peerId
    const peer = DebugPeer.getPeerById(peerId)
    peer && peer.setupWS(ws)
  })
}