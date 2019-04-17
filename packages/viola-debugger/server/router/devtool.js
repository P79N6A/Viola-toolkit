const DebugPeer = require('../po/DebugPeer')

const log = require('../util/log')

const PATH = '/devtool'

module.exports = function setupRouter (app) {
  /**
   * A middle ws between devtoolUI and debugPage
   */
  app.ws(`${PATH}/:peerId`, function(ws, req) {
    /**
     * @todo get DevtoolPage by peerId, setup websockect with it
     */
    let peer = DebugPeer.getPeerById(req.params.peerId)
    if (peer) {
      peer.getDevtoolPage().setupWS(ws)
    } else {
      log.title('DEVTOOLS PEER NOT FOUND').error(req.params.peerId)
    }
  })
}
