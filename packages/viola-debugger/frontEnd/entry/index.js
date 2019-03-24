const QRCode = require('qrcode')

import TYPES from './TYPES'

import {
  query
} from '../util/index'

import WS from './ws'

// window.__id__ = Date.now()

window.entryWs = new WS({
  url: `ws://127.0.0.1:${location.port}/entry/`,
  on: {
    open (ws) {
      ws.sendTask(TYPES.LOGIN, {
        channelId: query.get('channel')
      })
    },
    msg (ws, {type, data}) {
      switch (type) {
        case TYPES.LOGIN_SUCC:
          window.__ENTRY_ID__ = data.entryId
          window.__VIOLA_DEBUG_SERVER_ENV__ = {
            ...(data.env)
          }
          genQRCode(data.env)
      }
    }
  }
})
// // setup websocket
// setupEntryWS(config)

const $ = (s) => document.querySelector(s)
const $$ = (s) => document.querySelectorAll(s)

const $app = $('#app')

/**
 * generate QRCode
 * @param {*} config 
 */
function genQRCode (config) {
  let pages = config.pages
  let pageIdList = Array.isArray(pages) ? pages : Object.keys(pages)
  let docFrag = document.createDocumentFragment()
  let count = pageIdList.length
  let channelId = query.get('channel')
  pageIdList.forEach(pageId => {
    let url = `${config.debugJS}?ws=${config.ws}&pageId=${pageId}&_rij_violaUrl=1&entryId=${window.__ENTRY_ID__}&channel=${channelId}`
    QRCode.toCanvas(url, (error, canvas) => {
      if (error) throw error
      let link = document.createElement('a')
      link.href = url
      link.title = url
      link.appendChild(canvas)
      link.appendChild(document.createTextNode(pages[pageId]))
      docFrag.appendChild(link)
      if(!(--count)) {
        renderQRCode(docFrag)
      }
    })
  })
}

/**
 * 
 * @param {DocumentFragment} docFrag 
 */
function renderQRCode (docFrag) {
  $app.appendChild(docFrag)
}

// // setup websocket
// setupEntryWS(config)