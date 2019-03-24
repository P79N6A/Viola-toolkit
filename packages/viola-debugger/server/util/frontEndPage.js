const debuggerConfig = require('./config').debugger

function getEntryPageUrl (channelId) {
  return `http://127.0.0.1:${debuggerConfig.port}/${debuggerConfig.FE.entryPage}?channel=${channelId}`
}

function getDebugPageUrl (pageId) {
  return `http://127.0.0.1:${debuggerConfig.port}/${debuggerConfig.FE.debugPage}?pageId=${pageId}`
}

module.exports = {
  getEntryPageUrl,
  getDebugPageUrl
}