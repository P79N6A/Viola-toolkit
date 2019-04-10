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

function watchFileById(pageId, listener) {
  let timer = null, filePath
  if (filePath = getPathById(pageId)) {
    const fs = require('./config').debugger.fs
    fs.watch && fs.watch(filePath, (eventType, filename) => {
      if (timer) {
        return
      }
      timer = setTimeout(() => {
        timer = null
      }, 5000)

      log.info('file Change')
      listener(eventType, filename)
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