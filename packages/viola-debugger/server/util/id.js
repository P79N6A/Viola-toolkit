const DEFAULT_KEY = '__ID__'

let idMap = {
  [DEFAULT_KEY]: 0
}

/**
 * generate uniqueId
 * @param {string} [ns] namespace
 * @returns {string} uniqueId
 */
function generateId (ns = '', d = '_') {
  return ns + (ns in idMap ? (++idMap[DEFAULT_KEY]) : (d + (idMap[ns] = 1)))
}

module.exports = {
  generateId
}