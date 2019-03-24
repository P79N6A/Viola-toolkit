const entryPages = Object.create(null)

const DebugPeer = require('./DebugPeer')

const {
  ENTRY_WS_ID
} = require('../const/entry')

class EntryPage {
  constructor ({
    id,
    ws
  }) {
    this.id = id
    this.ws = ws
    ws[ENTRY_WS_ID] = this.id
    this.peers = Object.create(null)
    entryPages[this.id] = this
  }

  static getEntryPageById (id) {
    return entryPages[id]
  }

  static getEntryPageByWS (ws) {
    return EntryPage.getEntryPageById(ws[ENTRY_WS_ID])
  }

  static destroyEntryPageById (id) {
    let entryPage = EntryPage.getEntryPageById(id)
    return entryPage ? entryPage.destroy() : false
  }

  static destroyEntryPageByWS (ws) {
    let entryPage = EntryPage.getEntryPageByWS(ws)
    return entryPage ? entryPage.destroy() : false
  }

  destroy () {
    entryPages[this.id] = null
    this.peers = null
    this.ws[ENTRY_WS_ID] = null
    this.ws = null
    return true
  }

  addDebugDevice (ws, {
    pageId,
    ViolaEnv,
    viola
  }) {
    let peer = this.peers[pageId]
    if (peer) {
      // @todo replay history task
      peer.addDevice(ws)
    } else {
      peer = this.peers[pageId] = new DebugPeer({
        host: this,
        deviceWS: ws,
        pageId,
        globalVar: {
          ViolaEnv,
          viola
        }
      })
    }
    return peer
  }

  callJS ({
    ws,
    pageId,
    task
  }) {
    let peer = this.peers[pageId]
    if (peer) {
      peer.notifyPage({task})
    } else {
      log.title('No peer found in CallJS').error({
        entryPage: this.id,
        pageId
      })
    }
  }

  _genPeer (pageId) {
    const peer = new DebugPeer({
      host: this,
      pageId
    })
    return (this.peers[peer.id] = peer)
  }
}

module.exports = EntryPage