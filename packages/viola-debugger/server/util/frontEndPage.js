const c = require('./config')
const debuggerConfig = c.debugger
const headlessConfig = c.headless

function getEntryPageUrl (channelId) {
  return `http://127.0.0.1:${debuggerConfig.port}/${debuggerConfig.FE.entryPage}?channel=${channelId}`
}

function getDebugPageUrl (pageId) {
  return `http://127.0.0.1:${debuggerConfig.port}/${debuggerConfig.FE.debugPage}?pageId=${pageId}`
}

function getDevToolUrl (ws) {
  return `http://127.0.0.1:${debuggerConfig.port}/${debuggerConfig.FE.devtool}?ws=${ws}`
}

function getDebugPageWSForDevTool (targetId) {
  return `localhost:${headlessConfig.port}/devtools/page/${targetId}`
}

function getDevtoolsWS (peerId) {
  return `localhost:${debuggerConfig.port}/devtool/${peerId}`
}

module.exports = {
  getEntryPageUrl,
  getDebugPageUrl,
  getDevToolUrl,
  getDebugPageWSForDevTool,
  getDevtoolsWS
}