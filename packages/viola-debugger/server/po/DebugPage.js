const {
  generateId
} = require('../util/id')

const EventEmitter = require('events');

const log = require('../util/log')

const puppeteer = require('puppeteer-core')

const config = require('../util/config').headless

const {
  getPathById,
  watchFileById
} = require('../util/pageManager')

const {
  getDebugPageUrl
} = require('../util/frontEndPage')

let browser = null

const NATIVE_PAGE_EVENTS = {
  // @todo Is it right to define LOAD with domcontentloaded ??
  LOAD: 'domcontentloaded',
  JSLOAD: 'load',
  CLOSE: 'close',
  PAGE_ERROR: 'pageerror'
}

const PAGE_EVENTS = {
  ...NATIVE_PAGE_EVENTS,
  BEFORE_OPEN: 'beforeopen',
  RELOAD: 'reload',
  CALL_NATIVE: 'callNative'
}

const PAGE_STATUS = {
  DISCONNECTED: 'disconnected',
  OFFLINE: 'offline',
  IDLE: 'idle',
  CONNECT: 'connect'
}

const VIOLA = require('../const/viola')

class DebugPage extends EventEmitter {
  constructor ({
    peer,
    pageId,
    globalVar,
    emulateOptions,
    watch = true
  }) {
    super()
    this.id = generateId('dp')
    this._peer = peer
    this._pageId = pageId
    this._targetPageUrl = getPathById(pageId)
    this.watch = watch
    this.target = null
    this.page = null
    this._url = null
    this._globalVar = globalVar || Object.create(null)
    this.status = PAGE_STATUS.DISCONNECTED
    this.debugWSUrl = ''
    this.emulateOptions = emulateOptions || null
    
    this._hasLoadOnce = false
    this._needEmitReload = true

    this._pendingTaskList = []
  }

  static async launch () {
    // @todo active browser
    if (browser) return browser
    let port = config.port || 9222
    let executablePath = require('../util/config').debugger.chromePath
    try {
      browser = await puppeteer.launch({
        args: [`--remote-debugging-port=${port}`],
        executablePath
      });
      return browser
    } catch (e) {
      // log.title('Launch Browser Error').error(e)
      console.error('Launch Browser Error')
      throw e
    }
  }
  
  static browser () {
    return browser
  }

  destroy () {
    this.close()
    this._peer = null
    this._pendingTaskList.length = 0
  }

  async open () {
    if (!browser) {
      await DebugPage.launch()
      let pages = await browser.pages()
      this.page = pages[0]
    } else {
      this.page = await browser.newPage()
    }
    const url = getDebugPageUrl(this._pageId)
    await this._injectCallNative()

    // Notice: page before open EVENT! Async!
    this.emit(PAGE_EVENTS.BEFORE_OPEN, this.page)

    // inject global variable sync 
    Object.keys(this._globalVar).forEach(async (key) => {
      await this.injectGlobalVar(key, this._globalVar[key])
    })

    log.info('after emit')
    
    // emulate device
    await this.emulate()
    
    // route to debug page
    await this.page.goto(url)
    
    this._setupListener()
    
    this._watchFile()

    log.title('open').info(this._pageId)

    this.target = this.page.target()

    this.setStatus(PAGE_STATUS.CONNECT)
    // this.debugWSUrl = getDebugPageWS()

    return {
      target: this.target._targetInfo
    }
  }

  async emulate () {
    if (this.emulateOptions) {
      let opt = this.emulateOptions
      await this.page.emulate({
        viewport: {
          width: opt.width,
          height: opt.height,
          deviceScaleFactor: opt.deviceScaleFactor || 2,
          isMobile: true,
          hasTouch: true,
          isLandscape: false
        },
        userAgent: opt.userAgent
      })
      // await this.page.emulate(iPhone)
      // log.title('emulate').info(iPhone)
    }
  }

  async _injectCallNative () {
    return await this.injectGlobalFnc('callNative', this.callNative.bind(this))
  }
  async injectGlobalFnc (fncName, fnc) {
    return await this.page.exposeFunction(fncName, fnc)
  }
  async injectGlobalVar (key, value) {
    log.title('inject Global Var').info(key, value)
    await this.page.evaluateOnNewDocument((key, value) => {
      if (window[key]) {
        let originValue = window[key]
        if (Object.prototype.toString.call(value) === '[object Object]') {
          Object.keys(value).forEach(_key => {
            originValue[_key] = value[_key]
          })
        } else if (Array.isArray(value)) {
          originValue = originValue.concat(value)
        } else {
          window[key] = value
        }
      } else {
        window[key] = value
      }
    }, key, value)
  }
  callNative (instanceId, task) {
    log.title('callNative').info({instanceId, task})
    this.emit('callNative', {
      instanceId,
      task
    })
    if (task[0].method === 'createBody') {
      this._actPendingViolaTask()
    }
  }
  async evaluateCallJS (task) {
    return this.callJS(task)
  }
  async callJS (task) {
    // get viola and send
    this._evalViolaApi([VIOLA.PROPERTY.TASKER, VIOLA.API.RECEIVE], task)
  }
  updateInstance (data) {
    // get viola and send
    this.emitInstanceEvent(VIOLA.EVENTS.UPDATE, data)
  }
  destroyInstance () {
    this.emitInstanceEvent(VIOLA.EVENTS.DESTROY)
  }
  async emitInstanceEvent (type, data) {
    // get viola and send
    this._evalViolaApi(VIOLA.API.ACT, type, data)
  }
  /**
   * get body JSON
   * @returns {object<string,any>}
   */
  async getViolaBodyJSON () {
    // let violaHandler = await this.page.evaluateHandle('viola')
    let violaHandler = await this._getViolaHandler()
    let bodyJSON = await this.page.evaluate(async (viola) => viola.document.body.toJSON(), violaHandler)
    violaHandler.dispose()
    log.title('bodyJSON').info(bodyJSON)
    return bodyJSON
  }

  async _getViolaHandler () {
    let violaHandler
    if (this.page) {
      try {
        violaHandler = await this.page.evaluateHandle('viola')
      } catch (e) {
        let errorStack = e.message.split(/(?:\s*)at/)
        log.title('DebugPage.prototype._getViolaHandler ERROR').error(errorStack[0], errorStack[1])
        log.title('DebugPage.prototype._getViolaHandler ERROR').info(e)
        violaHandler = null
      }
    }
    return violaHandler
  }

  async _evalViolaApi (fnc, ...args) {
    log.title('_evalViolaApi').warn(fnc, args)
    // log.title('page').warn(Object.prototype.toString.call(this.page))
    let violaHandler = await this._getViolaHandler()
    // log.title('violaHandler').warn(Object.prototype.toString.call(violaHandler))
    if (violaHandler && !this._isReloading) {
      try {
        await this.page.evaluate(async (viola, fnc, args) => {
          if (Array.isArray(fnc)) {
            let evalFncName = fnc.pop()
            let evalFncHost = (fnc.reduce((viola, fncName) => {
              return viola[fncName]
            }, viola))
            evalFncHost[evalFncName](...args)
          } else {
            viola[fnc](...args)
          }
        }, violaHandler, fnc, args)
      } catch (e) {
        let errorStack = e.message.split('at')
        log.title('DebugPage.prototype._evalViolaApi ERROR').warn(errorStack[0])
        log.title('DebugPage.prototype._evalViolaApi ERROR').info(e)
      }
    } else {
      log.title('_evalViolaApi Pending').warn(fnc, args)
      this._pendingTaskList.push({
        fnc,
        args
      })
    }
  }

  async _actPendingViolaTask () {
    if (this._pendingTaskList[0]) {
      while (this._pendingTaskList[0]) {
        let { fnc, args } = this._pendingTaskList.shift()
        await this._evalViolaApi(fnc, ...args)
      }
    }
  }

  _setupListener () {
    // fake reload
    this.page.on(NATIVE_PAGE_EVENTS.LOAD, (event) => {
      let eventName
      // if (!this._hasLoadOnce) {
      //   this._hasLoadOnce = 1
      //   eventName = NATIVE_PAGE_EVENTS.LOAD
      // } else {
        eventName = PAGE_EVENTS.RELOAD
      // }
      log.title('PAGE_EVENTS LOAD TYPE').info(eventName)
      if (this._needEmitReload) {
        this.emit(eventName, event)
      } else {
        // reset
        this._needEmitReload = true
      }
      this._isReloading = false
      this.setStatus(PAGE_STATUS.CONNECT)
    })
    
    this.page.on(NATIVE_PAGE_EVENTS.CLOSE, e => {
      this.setStatus(PAGE_STATUS.DISCONNECTED)
      this.emit(NATIVE_PAGE_EVENTS.CLOSE, e)
    })

    // this.page.on(NATIVE_PAGE_EVENTS.JSLOAD, e => {
    //   this._actPendingViolaTask()
    // })

    Object.keys(NATIVE_PAGE_EVENTS).forEach(eventName => {
      ['LOAD', 'CLOSE', 'JSLOAD'].includes(eventName) || this.page.on(NATIVE_PAGE_EVENTS[eventName], (event) => {
        this.emit(NATIVE_PAGE_EVENTS[eventName], event)
      })
    })
  }

  _watchFile () {
    if (this.watch) {
      watchFileById(this._pageId, () => {
        this.refresh()
      })
    }
  }

  async refresh (needEmitReload = true) {
    this._needEmitReload = needEmitReload
    this._isReloading = true
    log.title('refreshing').warn()
    await this.page.reload()
  }

  async close () {
    this.setStatus(PAGE_STATUS.DISCONNECTED)
    await this.page.close()
  }

  setStatus (status) {
    log.title('DebugPage status change').info(status)
    this.status = status
  }

  isConnected () {
    return this.status !== PAGE_STATUS.DISCONNECTED
  }

  async idle () {
    log.title('IDLE').warn()
    this.setStatus(PAGE_STATUS.IDLE)
    /** @todo */
    // let window = await this.page.evaluateHandle('window')
    // this.page.evaluate(async (window) => {
    //   await window.console.log('disconnect device')
    // }, window)
  }

  async connect () {
    this.setStatus(PAGE_STATUS.CONNECT)
    /** @todo */
    let window = await this.page.evaluateHandle('window')
    this.page.evaluate(async (window) => {
      await window.console.log('on connect')
    }, window)
  }
}

DebugPage.EVENTS = PAGE_EVENTS
DebugPage.STATUS = PAGE_STATUS

module.exports = DebugPage