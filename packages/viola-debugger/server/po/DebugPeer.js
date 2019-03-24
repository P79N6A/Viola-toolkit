const {
  generateId
} = require('../util/id')

const log = require('../util/log')

const {
  saveArrayData
} = require('../util/IO')

const NATIVE_MSG_TYPE = require('../const/native')

const DebugPage = require('./DebugPage')

const EVENTS = DebugPage.EVENTS

const MSG = require('./MSG')

const path = require('path')

const PEER_NATIVE_WS_ID = '__PEER_NATIVE_WS_ID__'

const peers = {}

/**
 * each debugPage is a Peer
 */
class DebugPeer {
  constructor({
    host,
    pageId,
    deviceWS,
    globalVar
  }) {
    this.id = generateId('peer')
    this._host = host
    this._pageId = pageId
    this.debugPage = null
    this._globalVar = {
      ...globalVar
    }
    this.deviceList = deviceWS ? [(deviceWS[PEER_NATIVE_WS_ID] = this.id) && deviceWS] : []
    this.targetId = null
    this.historyTask = Object.create(null)

    peers[this.id] = this
    this.initPage()
  }

  static getPeerById (id) {
    return peers[id]
  }

  destroy () {
    peers[this.id] = null
    this.historyTask = null
    this.debugPage = null
    this.clearDevice()
  }
  
  async initPage () {
    
    this.debugPage = new DebugPage({
      pageId: this._pageId,
      globalVar: this._globalVar
    })

    const EVENT_PROCESSER = {
      [EVENTS.CALL_NATIVE]: ({task}) => {
        this.notifyDevice({
          type: NATIVE_MSG_TYPE.CALL_NATIVE,
          task
        })
      },
      [EVENTS.BEFORE_OPEN]: async () => {
        let globalVar = this._globalVar
        this.debugPage.injectGlobalVar('__DEV_INFO__', {
          peerId: this.id,
          peerHost: this._host && this._host.id
        })
        await this.debugPage.injectGlobalVar('ViolaEnv', globalVar.ViolaEnv)
        await this.debugPage.injectGlobalVar('__CREATE_INSTANCE__', {
          instanceId: globalVar.viola.instanceId,
          pageData: globalVar.viola.pageData
        })
      },
      [EVENTS.RELOAD]: () => {
        log.info('reload to reset historyList')
        this.notifyDevice({
          type: NATIVE_MSG_TYPE.RELOAD,
          task: {}
        }, false)
        this.resetHistory(false)
      },
      [EVENTS.PAGE_ERROR]: (e) => {
        log.error(e)
      },
      [EVENTS.CLOSE]: () => {
        log.title('page close').info('close to reset historyList')
        Object.keys(EVENT_PROCESSER).forEach(eventName => {
          this.debugPage.off(eventName, EVENT_PROCESSER[eventName])
        })
        this.clearDevice()
      }
    }

    Object.keys(EVENT_PROCESSER).forEach(eventName => {
      this.debugPage.on(eventName, EVENT_PROCESSER[eventName])
    })

    const targetInfo = await this.debugPage.open()
    log.title('_targetInfo').info(targetInfo)
  }

  addDevice (deviceWS) {
    if (deviceWS) {
      this.deviceList.push(deviceWS)
      this.replayHistory(NATIVE_MSG_TYPE.CALL_NATIVE, deviceWS)
    }
  }

  rmDevice (ws) {
    const list = this.deviceList
    let i = -1
    if (ws && ((i = list.indexOf(ws)) !== -1)) {
      list.splice(i, 1)
      ws.close()
    }
  }

  clearDevice () {
    while (this.deviceList.length) {
      this.deviceList.pop().close()
    }
  }

  notifyPage ({
    task
  }) {
    // console.log('notifyPage')
    // this.debugPage.evaluateCallJS(this.globalVar.viola.instanceId, task)
    this.debugPage.evaluateCallJS(task)
    this.pushHistory(NATIVE_MSG_TYPE.CALL_JS, task)
  }

  notifyDevice ({
    type,
    task
  }, isRecord = true) {
    let msg = MSG.genMsg(type, task)
    if (this.deviceList.length) {
      this.deviceList.forEach(ws => {
        ws.send(msg)
      })
    }
    // history
    isRecord && this.pushHistory(type, task)
  }

  pushHistory (type, task) {
    log.title('push history ' + type).info(task)
    if (!this.historyTask[type]) {
      this.historyTask[type] = []
    }
    let history = this.historyTask[type]
    if (Array.isArray(task)) {
      this.historyTask[type] = history.concat(task)
    } else {
      history.push(task)
    }
  }

  replayHistory (type, ws) {
    let history = this.historyTask[type]
    if (history) {
      ws.send(MSG.genMsg(type, history))
    }
  }

  resetHistory (isSaveAsFile = false) {
    /** @todo save/export history */
    if (isSaveAsFile && Object.keys(this.historyTask).length) {
      saveArrayData(
        path.resolve(__dirname, `../log/history${Date.now()}.txt`),
        this.historyTask
      )
    }
    this.historyTask = Object.create(null)
  }
}

// module.exports = {
//   Peer,
//   getTargetIdByPageId,
//   getPeerByPageId,
//   genPeersByMap
// }
module.exports = DebugPeer