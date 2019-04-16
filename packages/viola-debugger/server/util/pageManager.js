const log = require('./log')

let __pageid__ = 1

let pageMap = Object.create(null)

function genId () {
  return '__pageid__' + (__pageid__++)
}

/**
 * generate map by pageList
 * @param {Array<string>} pageList page name list
 * @returns {Map<string, string>}
 */
function genIdwithMap (pageList) {
  return pageList.reduce((map, page) => {
    map[genId()] = page
    return map
  }, pageMap)
}

function getPageMap () {
  return pageMap
}

function getPathById (pageId) {
  return pageMap[pageId]
}

function watchFileById(pageId, callback) {
  let timer = null, filePath
  if (filePath = getPathById(pageId)) {
    const fs = require('./config').debugger.fs
    // fs.watch will
    // fs.watch && fs.watch(filePath, (eventType, filename) => {
    //   if (timer) {
    //     return
    //   } else {
    //     listener(eventType, filename)
    //     // update next time AFTER 3000ms
    //     // @todo 3000ms can be set
    //     timer = setTimeout(() => {
    //       timer = null
    //     }, 3000)
    //   }
    // })
    fs.watchFile && fs.watchFile(filePath, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        callback(filePath)
      }
    })
  }
}

module.exports = {
  genId,
  genIdwithMap,
  getPathById,
  getPageMap,
  watchFileById
}