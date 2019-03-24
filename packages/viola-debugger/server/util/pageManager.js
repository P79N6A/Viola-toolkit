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

module.exports = {
  genId,
  genIdwithMap,
  getPathById,
  getPageMap
}