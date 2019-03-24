// const Builder = require('./builder')
const {
  startServer
} = require('./server/app')

function startDebug (config) {
  startServer(config)
  // get pageId
  // const pageMap = genIdwithMap(Array.isArray(config.targets) ? config.targets : [config.targets])
  // console.log(pageMap)
  // console.log(boxen(`
  //   inspect file:
  //     ${pageMap}
  //   server listen at ${config.port}
  // `))
  // start server
  // const targetArray = config.target
}

// function build (config) {
//   builder.watch(config)
//   builder.on('watchUpdate', (stats) => {

//   })
// }

module.exports = {
  startDebug
}