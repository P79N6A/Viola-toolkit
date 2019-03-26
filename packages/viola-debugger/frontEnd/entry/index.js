const QRCode = require('qrcode')

import TYPES from './TYPES'

import {
  query
} from '../util/index'

import WS from './ws'

// window.__id__ = Date.now()
let channelId = query.get('channel') || ''
window.entryWs = new WS({
  url: `ws://127.0.0.1:${location.port}/channel/${channelId}`,
  on: {
    open (ws) {
      ws.sendTask(TYPES.LOGIN, {
        channelId
      })
    },
    msg (ws, {type, data}) {
      switch (type) {
        case TYPES.LOGIN_SUCC:
          window.__CHANNEL_ID__ = data.channelId
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
  let peerMap = config.peerMap
  let peerIdList = Array.isArray(peerMap) ? peerMap : Object.keys(peerMap)
  let docFrag = document.createDocumentFragment()
  let count = peerIdList.length
  let channelId = query.get('channel')
  peerIdList.forEach(peerId => {
    let url = `${config.debugJS}?ws=${config.ws}&peerId=${peerId}&_rij_violaUrl=1&channel=${channelId}`
    QRCode.toCanvas(url, (error, canvas) => {
      if (error) throw error
      let link = document.createElement('a')
      link.href = url
      link.title = url
      link.appendChild(canvas)
      link.appendChild(document.createTextNode(peerMap[peerId]))
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