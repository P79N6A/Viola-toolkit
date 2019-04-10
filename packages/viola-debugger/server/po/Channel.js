const {
  generateId
} = require('../util/id')

const {
  openChrome
} = require('../util/opn')

const {
  getEnvBaseInfo
} = require('../util/env')

const {
  getPageMap
} = require('../util/pageManager')

const log = require('../util/log')

const {
  getEntryPageUrl
} = require('../util/frontEndPage')

const MSG = require('./MSG')

const DebugPeer = require('./DebugPeer')

// const {
//   ENTRY_WS_ID
// } = require('../const/entry')

const channels = Object.create(null)

const CHANNEL_ID = '__channel_id__'

const TYPES = {
  ERROR: 'error',
  LOGIN: 'login',
  LOGIN_SUCC: 'loginSucc',
  ADD_DEVICE: 'addDevice',
  RM_DEVICE: 'rmDevice',
  ROUTE_TO: 'routeTo'
}

class Channel {
  constructor ({
    ws
  }) {
    this.id = generateId('channel')
    if (ws) {
      this.ws = ws
      this.setupWS(ws)
    }
    this.pageMap = getPageMap()
    this.peers = Object.create(null)
    this._genPeers()
    channels[this.id] = this
  }

  static getChannelById (id) {
    return channels[id]
  }

  static getChannelByWS (ws) {
    return Channel.getChannelById(ws[CHANNEL_ID])
  }

  static destroyChannelById (id) {
    let entryPage = Channel.getChannelById(id)
    return entryPage ? entryPage.destroy() : false
  }

  static destroyChannelByWS (ws) {
    let entryPage = Channel.getChannelByWS(ws)
    return entryPage ? entryPage.destroy() : false
  }

  destroy () {
    channels[this.id] = null
    this.peers = null
    this.ws[CHANNEL_ID] = null
    this.ws = null
  }

  _genPeers () {
    Object.keys(this.pageMap).forEach(pageId => {
      this.peers[pageId] = new DebugPeer({
        pageId
      })
    })
  }

  setupWS (ws) {
    ws[CHANNEL_ID] = this.id
    ws.on('message', (msg) => {
      const {type, data} = MSG.parse(msg)
      switch (type) {
        case TYPES.LOGIN:
          log.info('Entry Page login: ', data)
          const env = getEnvBaseInfo()
          
          env.peerMap = Object.keys(this.peers).reduce((m, pageId) => {
            return (m[this.peers[pageId].id] = env.pageMap[pageId]) && m
          }, Object.create(null))

          ws.send(MSG.genMsg(TYPES.LOGIN_SUCC, {
            channelId: this.id,
            env
          }))
          break

        case TYPES.ROUTE_TO:
          log.info('route to: ', data.pageId)
      }
      
    })

    ws.on('close', () => {
      log.info('Entry Page Close')
    })
  }

  hasWS () {
    return !!this.ws
  }

  open () {
    let url = getEntryPageUrl(this.id)
    log.title('open').info(url)
    openChrome(url)
  }
}

module.exports = Channel