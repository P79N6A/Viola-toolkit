const puppeteer = require('puppeteer');
const {
  Peer
} = require('../peers')
// const devices = require('puppeteer/DeviceDescriptors');
// const iPhoneX = devices['iPhone X'];

let browser = null

const config = require('../util/config').headless

/**
 * @todo exposeFunction => callNative / callJS
 */
class DebugPage {
  constructor (id) {
    this._id = id
    this.target = null
    this.page = null
    this._peer = null
    this._url = null
  }
  // setupPeer () {
  //   this._peer = new Peer({
  //     id: this._id,
  //     url: this._url
  //   })
  // }
  async open ({
    url
  }) {
    if (!browser) {
      await DebugPage.launch()
    }
    const page = await browser.newPage();
    await page.goto(url);
    this.target = page.target()
    this.page = page
    return this.target._targetInfo
  }
  callNative () {}
  callJS () {}
  async refresh () {
    await this.page.reload()
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
}

module.exports = DebugPage