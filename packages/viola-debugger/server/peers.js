const peers = {}

function getTargetIdByPageId (pageId) {
  return peers[pageId] && peers[pageId].targetId
}

function getPeerByPageId (pageId) {
  return peers[pageId]
}

/**
 * each debugPage is a Peer
 */
class Peer {
  constructor(page) {
    this.id = page.id
    this.pageUrl = page.url
    this.deviceList = []
    this.targetId = null
    this.historyTask = []

    peers[this.id] = this
  }
  
  setPage (page) {
    this.page = page
  }

  setTargetId (targetId) {
    if (targetId) {
      this.targetId = targetId
    } else {
      throw new TypeError('setTargetId require param: targetId')
    }
  }

  addDevice (deviceWS) {
    deviceWS && this.deviceList.push(deviceWS)
  }

  rmDevice (ws) {
    const list = this.deviceList
    let i = -1
    ws && ((i = list.indexOf(ws)) !== -1) && (list.splice(i, 1))
  }

  notifyPage ({}) {

  }

  notifyDevice ({
    msg, ws, prefix
  }) {
    if (ws) {
      ws.send(msg)
    }
    if (this.deviceList.length) {
      this.deviceList.forEach(ws => {
        ws.send(msg)
      })
    }
    // history
    this.pushHistory(msg, prefix)
  }

  pushHistory (msg, prefix = '') {
    console.log(`${prefix} history: ${msg}`)
    this.historyTask.push(msg)
  }
}

function genPeersByMap (pageMap) {
  Object.keys(pageMap).forEach(id => {
    new Peer({
      id,
      url: pageMap[id]
    })
  })
}

module.exports = {
  Peer,
  getTargetIdByPageId,
  getPeerByPageId,
  genPeersByMap
}