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
const NATIVE_WS_ID = '__NATIVE_WS_ID__'

const peers = {}

/**
 * each debugPage is a Peer
 */
class DebugPeer {
  constructor({
    pageId,
    deviceWS
  }) {
    this.id = generateId('peer')
    // this._host = host
    this._pageId = pageId
    this.debugPage = null
    this.deviceList = deviceWS ? [(deviceWS[PEER_NATIVE_WS_ID] = this.id) && deviceWS] : []
    this.deviceMap = Object.create(null)
    this.targetInfo = null
    this.historyTask = Object.create(null)

    this._globalVar = {
      ViolaEnv: null,
      viola: null
    }
    this._hasOpen = false

    peers[this.id] = this
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

    if (this.debugPage && this.debugPage.status !== DebugPage.STATUS.OFFLINE) return
    
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
        log.title('before open').info('open')
        let globalVar = this._globalVar
        await this.debugPage.injectGlobalVar('__DEV_INFO__', {
          peerId: this.id
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
        let errorStack = e.message.split('at')
        let errorMsg = errorStack[0] + errorStack[1].split('(')[0]
        log.title('e.message').error(errorMsg)
        
        this.notifyDevice({
          type: NATIVE_MSG_TYPE.ERROR,
          task: errorMsg
        })
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
      log.title('listenTo').info(eventName)
      this.debugPage.on(eventName, EVENT_PROCESSER[eventName])
    })

    this.targetInfo = await this.debugPage.open()
    log.title('_targetInfo').info(this.targetInfo)
  }

  addDevice (deviceWS) {
    if (deviceWS) {
      deviceWS[PEER_NATIVE_WS_ID] = this.id
      deviceWS[NATIVE_WS_ID] = generateId('nativePeer')
      
      // store device websocket
      this.deviceList.push(deviceWS)

      // Is the first device join in
      if (this.deviceList.length === 1) {
        this.initPage()
        // this.debugPage.connect()
      }
      
      if (this.hasHistory(NATIVE_MSG_TYPE.CALL_NATIVE)) {
        this.replayHistory(NATIVE_MSG_TYPE.CALL_NATIVE, deviceWS)
      }
    }
  }

  rmDevice (ws) {
    const list = this.deviceList
    let i = -1
    if (ws && ((i = list.indexOf(ws)) !== -1)) {
      list.splice(i, 1)
      ws.close()
      if (!list.length) {
        // this.debugPage.setStatus('idle')
        this.debugPage.idle()
      }
    }
  }

  clearDevice () {
    while (this.deviceList.length) {
      this.deviceList.pop().close()
    }
  }

  setupWS (ws) {
    ws.on('message', (msg) => {
      const { type, data } = MSG.parse(msg)
      switch (type) {
        case NATIVE_MSG_TYPE.CALL_JS:
          log.title('callJS').info(data)
          this.notifyPage({
            task: data.task
          })
          break
        case NATIVE_MSG_TYPE.LOGIN:
          log.info('login data', data)
          /** @todo select ViolaEnv when debuging OR using worker as a sandbox */
          if (!this._globalVar.ViolaEnv) {
            this._globalVar.ViolaEnv = data.ViolaEnv
            this._globalVar.viola = data.viola
          }
          this.addDevice(ws)
          break;
      }
    });
    ws.on('close', (code, msg) => {
      log.info('device close')
      this.rmDevice(ws)
    })
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
      log.title('send msg to device').info(msg)
      this.deviceList.forEach(ws => {
        ws.send(msg)
      })
    }
    // history
    isRecord && this.pushHistory(type, task)
  }

  pushHistory (type, task) {
    // log.title('push history ' + type).info(task)
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

  hasHistory (type) {
    return (this.historyTask[type] && this.historyTask[type].length)
  }

  replayHistory (type, ws) {
    let history = this.historyTask[type]
    if (history) {
      log.title('replayHistory').info(MSG.genMsg(type, history))
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
module.exports = DebugPeer