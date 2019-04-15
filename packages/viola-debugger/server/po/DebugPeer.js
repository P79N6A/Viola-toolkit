const {
  generateId
} = require('../util/id')

const log = require('../util/log')

const {
  saveArrayData
} = require('../util/IO')

const NATIVE_MSG_TYPE = require('../const/native')
const CALL_MSG = 'call_msg'

const DebugPage = require('./DebugPage')
const DevtoolPage = require('./DevtoolPage')

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
    this.devtoolPage = null
    this.deviceList = deviceWS ? [(deviceWS[PEER_NATIVE_WS_ID] = this.id) && deviceWS] : []
    this.deviceMap = Object.create(null)
    this.targetInfo = null
    this.historyTask = Object.create(null)

    this._globalVar = {
      ViolaEnv: null,
      viola: null
    }
    this._hasOpenPeer = false
    this._hasOpenDevtool = false
    this._reload = false

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
  
  /**
   * init debugPage, listen to events
   */
  async initPage () {

    if (this.debugPage && this.debugPage.status !== DebugPage.STATUS.DISCONNECTED) return
    const globalVar = this._globalVar,
          ViolaEnv = globalVar.ViolaEnv
    this.debugPage = new DebugPage({
      pageId: this._pageId,
      globalVar: {
        __DEV_INFO__: {
          peerId: this.id
        },
        ViolaEnv,
        __CREATE_INSTANCE__: globalVar.viola
      },
      emulateOptions: {
        'width': parseInt(ViolaEnv.deviceWidth),
        'height': parseInt(ViolaEnv.deviceHeight),
        'deviceScaleFactor': parseFloat(ViolaEnv.dpToPxRatio),
        'userAgent': `${ViolaEnv.appName} ${ViolaEnv.appVersion}`
      }
    })

    const EVENT_PROCESSER = {
      [EVENTS.CALL_NATIVE]: ({task}) => {
        this.notifyDevice({
          type: NATIVE_MSG_TYPE.CALL_NATIVE,
          task
        })
        this.pushHistory(CALL_MSG, task)
      },
      [EVENTS.RELOAD]: () => {
        this._reload = true
        log.title('reload device length').info(this.deviceList.length)
        // notify device to reload
        this.notifyDevice({
          type: NATIVE_MSG_TYPE.RELOAD,
          task: {}
        }, false)
        // clear device
        this.deviceList.length = 0

        log.info('reload to reset historyList')
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
        this._hasOpenPeer = false
        this.clearDevice()
      }
    }

    Object.keys(EVENT_PROCESSER).forEach(eventName => {
      log.title('listenTo').info(eventName)
      this.debugPage.on(eventName, EVENT_PROCESSER[eventName])
    })

    let debugPageData = await this.debugPage.open()
    let {
      target
    } = debugPageData
    this._hasOpenPeer = true
    this.initDevtool(target.targetId)
    // log.title('_targetInfo').info(this.targetInfo)
  }

  async refreshPage () {
    if (this._hasOpenPeer) {
      this.debugPage.refresh(false)
    }
  }

  async addDevice (deviceWS) {
    if (deviceWS) {
      deviceWS[PEER_NATIVE_WS_ID] = this.id
      deviceWS[NATIVE_WS_ID] = generateId('nativePeer')
      
      // store device websocket
      this.deviceList.push(deviceWS)

      // Is the first device join in
      if (!this._hasOpenPeer) {
        this.initPage()
        // this.debugPage.connect()
      } else if (this.deviceList.length === 1) {
        if (this._reload) {
          log.title('reload').info()
          this.replayHistory(NATIVE_MSG_TYPE.CALL_NATIVE, deviceWS)
        } else {
          log.title('entry again').info()
          // entry again
          this.refreshPage()
        }
      } else if (this.hasHistory(NATIVE_MSG_TYPE.CALL_NATIVE)) {
        /** @todo use viola.document.body.toJSON to replace historyArray */
        // this.replayHistory(NATIVE_MSG_TYPE.CALL_NATIVE, deviceWS)
        /** @todo Don't make a task directly */
        log.title('replay HISTORY').info()
        let bodyJSON = await this.debugPage.getViolaBodyJSON()
        this.notifyDevice({
          type: NATIVE_MSG_TYPE.CALL_NATIVE,
          task: MSG.callNative(
            NATIVE_MSG_TYPE.MODULE.DOM,
            NATIVE_MSG_TYPE.METHOD.CREATE_BODY,
            bodyJSON
          ),
          ws: deviceWS
        }, false)
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
        this._reload = false
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
      let history = null
      switch (type) {
        // login to register this device
        case NATIVE_MSG_TYPE.LOGIN:
          log.info('login data', data)
          /** @todo select ViolaEnv when debuging OR using worker as a SandBox */
          if (!this._globalVar.ViolaEnv) {
            this._globalVar.ViolaEnv = data.ViolaEnv
            this._globalVar.viola = data.viola
          }
          this.addDevice(ws)
          break;

        // callJS
        case NATIVE_MSG_TYPE.CALL_JS:
          log.title('callJS').info(data)
          this.debugPage.evaluateCallJS(history = data.task)
          this.pushHistory(NATIVE_MSG_TYPE.CALL_JS, task)
          this.pushHistory(CALL_MSG, task)
          break

        // updateInstance
        case NATIVE_MSG_TYPE.UPDATE_INSTANCE:
          log.title(type).info(data)
          log.title('this.debugPage.status').info(this.debugPage.status)
          this.debugPage.updateInstance(history = data.args)
          break

        // destroyInstance
        case NATIVE_MSG_TYPE.DESTROY_INSTANCE:
          log.title(type).info()
          this.debugPage.destroyInstance()
          history = {}
          break
      }
      history && this.pushHistory(type, history)
    });
    ws.on('close', (code, msg) => {
      log.info('device close')
      this.rmDevice(ws)
    })
  }

  /** @deprecated */
  notifyPage ({type, task}) {
    // console.log('notifyPage')
    // this.debugPage.evaluateCallJS(this.globalVar.viola.instanceId, task)
    this.debugPage.evaluateCallJS(task)
    this.pushHistory(NATIVE_MSG_TYPE.CALL_JS, task)
    this.pushHistory(CALL_MSG, task)
  }

  notifyDevice ({type, task, ws }, isRecord = true) {
    let msg = MSG.genMsg(type, task)
    if (ws) {
      ws.send(msg)
    } else if (this.deviceList.length) {
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

  initDevtool (targetId) {
    this.devtoolPage = new DevtoolPage({
      targetId,
      peerId: this.id
    })
    this.devtoolPage.open()
    this._hasOpenDevtool = true
    this.devtoolPage.on(DevtoolPage.EVENTS.CLOSE, () => {
      this.reset()
      // this._hasOpenDevtool = false
      // this.clearDevice()
      // this.debugPage
    })
  }

  closeDevtool () {
    this.devtoolPage && this.devtoolPage.close()
  }

  reset () {
    log.title('devtool close').info()
    this._hasOpenDevtool = false
    // this.clearDevice()
    this.debugPage.destroy()
    this.resetHistory()
  }

  getDevtoolPage () {
    return this.devtoolPage
  }
}
module.exports = DebugPeer