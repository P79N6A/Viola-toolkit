const {
  generateId
} = require('../util/id')

const log = require('../util/log')

const opn = require('opn')

const {
  getEntryPageUrl
} = require('../util/frontEndPage')

const DebugPeer = require('./DebugPeer')

const EntryPage = require('./Channel')

/**
 * @typedef {Object<string, Channel>} ChannelMap
 */
/**
 * @type {ChannelMap} channelMap
 */
const channelMap = Object.create(null)

/**
 * @deprecated
 */
class Channel {
  constructor ({
    pageMap
  }) {
    this.id = generateId('channel')
    channelMap[this.id] = this
    
    this.pageMap = pageMap

    this.entryPages = Object.create(null)

    // this.entryPages = Object.create(null)

    this.nativePageWS = Object.create(null)

    this.peers = Object.create(null)

  }

  static getChannelById (channelId) {
    log.title('get ChannelMap').info(channelMap)
    return channelMap[channelId]
  }

  /**
   * generate peers
   */
  _genPeerByMap (pageMap) {
    pageMap && Object.keys(pageMap).forEach(id => {
      this.peers[id] = new DebugPeer(this)
    })
  }

  open () {
    let url = getEntryPageUrl(this.id)
    log.title('open').info(url)
    opn(url, {
      app: 'google chrome'
    })
  }

  addEntryPage (ws) {
    if (!ws) {
      log.error('addEntryPageWS 参数错误: ws')
      return null
    }
    const entryId = this.genEntryPageId()
    const entryPage = new EntryPage({ id: entryId, ws })
    log.title('generate EntryPage').info(entryPage.id)
    return (this.entryPages[entryId] = entryPage)
  }
  rmEntryPage (entryPage) {
    if (entryPage) {
      log.title('remove EntryPage: ').info(entryPage.id)
      entryPage.destroy()
      this.entryPages[entryPage.id] = null
    }
  }

  rmEntryPageByWS (ws) {
    this.rmEntryPage(EntryPage.getEntryPageByWS(ws))
  }

  genEntryPageId () {
    return generateId(this.id + '_entry')
  }

  getEntryPageById (entryId) {
    return this.entryPages[entryId]
  }

  addDevice (ws, dataFromNative) {
    let {
      entryId
    } = dataFromNative
    const curEntryPage = this.entryPages[entryId]
    if (curEntryPage) {
      curEntryPage.addDebugDevice(ws, dataFromNative)
    } else {
      log.title('Not Found entryPage').error(Object.keys(this.entryPages), entryId)
      ws.close(1003, 'Not Found entryPage')
    }
  }
  rmDevice (ws) {
    let {
      entryId
    } = dataFromNative
    const curEntryPage = this.entryPages[entryId]
    if (curEntryPage) {
      curEntryPage.addDebugDevice(ws, dataFromNative)
    } else {
      log.title('Not Found entryPage').error(Object.keys(this.entryPages), entryId)
      ws.close(1003, 'Not Found entryPage')
    }
  }

  callJS ({
    ws,
    pageId,
    entryId,
    task
  }) {
    const curEntryPage = this.entryPages[entryId]
    if (curEntryPage) {
      curEntryPage.callJS({
        ws,
        pageId,
        task
      })
    } else {
      log.title('Not Found entryPage').error(Object.keys(this.entryPages), entryId)
      ws.close(1003, 'Not Found entryPage')
    }
  }
}

module.exports = Channel