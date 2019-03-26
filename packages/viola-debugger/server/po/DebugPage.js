const {
  generateId
} = require('../util/id')

const EventEmitter = require('events');

const log = require('../util/log')

const puppeteer = require('puppeteer')

const config = require('../util/config').headless

const {
  getPathById
} = require('../util/pageManager')

const {
  getDebugPageUrl
} = require('../util/frontEndPage')

let browser = null

const NATIVE_PAGE_EVENTS = {
  // @todo Is it right to define LOAD with domcontentloaded ??
  LOAD: 'domcontentloaded',
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
  OFFLINE: 'offline',
  IDLE: 'idle',
  CONNECT: 'connect'
}

class DebugPage extends EventEmitter {
  constructor ({
    peer,
    pageId
  }) {
    super()
    this.id = generateId('dp')
    this._peer = peer
    this._pageId = pageId
    this._targetPageUrl = getPathById(pageId)
    this.target = null
    this.page = null
    this._url = null
    this._globalVar = Object.create(null)
    this._hasLoadOnce = 0
    this.status = PAGE_STATUS.OFFLINE
  }

  static async launch () {
    // @todo active browser
    if (browser) return browser
    let port = config.port || 9222
    try {
      browser = await puppeteer.launch({
        args: [`--remote-debugging-port=${port}`],
        headless: false,
        defaultViewport: {
          width: 1000,
          height: 800,
          isMobile: true,
          hasTouch: true
        },
        devtools: true
      });
      return browser
    } catch (e) {
      throw e
    }
  }
  
  static browser () {
    return browser
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

    this.emit(PAGE_EVENTS.BEFORE_OPEN, this.page)

    this._setupListener()
    
    await this.page.goto(url)

    log.title('open').info(this._pageId)

    // this.setStatus(PAGE_STATUS.IDLE)

    this.target = this.page.target()

    return this.target._targetInfo
  }
  async _injectCallNative () {
    return await this.injectGlobalFnc('callNative', this.callNative.bind(this))
  }
  async injectGlobalFnc (fncName, fnc) {
    return await this.page.exposeFunction(fncName, fnc)
  }
  async injectGlobalVar (key, value) {
    log.title('inject Global Var').info(key, value)
    if (this._globalVar[key]) {
      log.title('injectGlobalVar warning: duplicate variable').log(key, value)
    }
    await this.page.evaluateOnNewDocument((key, value) => {
      window[key] = value
    }, key, value)
  }
  callNative (instanceId, task) {
    log.title('callNative').info({instanceId, task})
    this.emit('callNative', {
      instanceId,
      task
    })
  }
  async evaluateCallJS (task) {
    return this.callJS(task)
  }
  async callJS (task) {
    // get viola and send
    let violaHandler = await this.page.evaluateHandle('viola')
    await this.page.evaluate(async (viola, task) => {
      await viola.tasker.receive(task)
    }, violaHandler, task);
  }

  _setupListener () {
    // fake reload
    this.page.on(NATIVE_PAGE_EVENTS.LOAD, (event) => {
      let eventName
      if (!this._hasLoadOnce) {
        this._hasLoadOnce = 1
        eventName = NATIVE_PAGE_EVENTS.LOAD
      } else {
        eventName = PAGE_EVENTS.RELOAD
      }
      log.title('PAGE_EVENTS LOAD TYPE').info(eventName)
      this.emit(eventName, event)
    })
    
    this.page.on(NATIVE_PAGE_EVENTS.CLOSE, e => {
      this.setStatus(PAGE_STATUS.OFFLINE)
      this.emit(NATIVE_PAGE_EVENTS.CLOSE, e)
    })

    Object.keys(NATIVE_PAGE_EVENTS).forEach(eventName => {
      ['LOAD', 'CLOSE'].includes(eventName) || this.page.on(NATIVE_PAGE_EVENTS[eventName], (event) => {
        this.emit(NATIVE_PAGE_EVENTS[eventName], event)
      })
    })
  }

  async refresh () {
    await this.page.reload()
  }

  async close () {
    await this.page.close()
  }

  setStatus (status) {
    this.status = status
  }

  async idle () {
    this.setStatus(PAGE_STATUS.IDLE)
    /** @todo */
    let window = await this.page.evaluateHandle('window')
    this.page.evaluate(async (window) => {
      await window.console.log('disconnect device')
    }, window)
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