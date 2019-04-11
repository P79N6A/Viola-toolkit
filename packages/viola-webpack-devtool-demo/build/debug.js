const args = require('yargs').argv
const common = require('./webpack.common.js')
const merge = require('webpack-merge')
const packup = require('./build')
const ViolaDebug = require('viola-debugger')
const path = require('path')
const MemoryFS = require('memory-fs');
const webpack = require('webpack');

const fs = new MemoryFS();

console.log(`${(new Date()).toTimeString()} args: `, args._)

const buildDir = args._

if (!buildDir || !Array.isArray(buildDir) || !buildDir.length) {
  throw new Error(`
    dev 模式请指定 page 目录:
    npm run debug [...pageName]
    `)
}

// webpack common config
const commonConfig = common({
  entry: buildDir
})

let options = merge(commonConfig, require('./webpack.dev'))

startDebuggerServer(options)

function startDebuggerServer (options, config) {
  // cover fileName
  if (options.output.filename) {
    options.output.filename = '[name].js'
  }

  console.log('options', options)

  const compiler = webpack(options)

  compiler.outputFileSystem = fs
  const serveConfig = compiler.options.devServer

  let ViolaDebugServer = null
  compiler.watch({
    aggregateTimeout: 300,
    poll: undefined
  }, (err, stats) => {
    // console.log(stats)
    if (err) {
      throw new Error(err)
    }
    // console.log(ViolaDebugServer)
    if (!ViolaDebugServer) {
      ViolaDebugServer = ViolaDebug.startServer({
        targets: transform(compiler.options.entry, compiler.options.output),
        autoOpen: true,
        multipleChannel: false,
        fs,
        ...serveConfig
      })
    } else {
      const peers = ViolaDebugServer.defaultChannel.peers
      Object.keys(peers).forEach(peerId => {
        let page = peers[peerId].debugPage
        page && page.refresh()
      })
    }
  });

  function transform (entry, output) {
    return Object.keys(entry).reduce((res, name) => {
      res.push(path.resolve(output.path, output.filename.replace('[name]', name)))
      return res
    }, [])
  }
}