const args = require('yargs').argv
const common = require('./webpack.common.js')
const merge = require('webpack-merge')
const packup = require('./build')
const ViolaDebug = require('viola-debugger')
const path = require('path')

console.log(`${(new Date()).toTimeString()} args: `, args._)

const buildDir = args._

if (!buildDir || !Array.isArray(buildDir) || !buildDir.length) {
  throw new Error(`
    dev 模式请指定 page 目录:
    npm run dev [...pageName]
    `)
}

// webpack common config
const commonConfig = common({
  entry: buildDir
})

console.log('page', commonConfig.entry, commonConfig.output)

packup(merge(commonConfig, require('./webpack.dev')))

function transform (entry, output) {
  return Object.keys(entry).reduce((res, name) => {
    res.push(path.resolve(output.path, output.filename.replace('[name]', name)))
    return res
  }, [])
}
console.log(transform(commonConfig.entry, commonConfig.output))
ViolaDebug.startDebug({
  port: 8086,
  targets: transform(commonConfig.entry, commonConfig.output),
  autoOpen: true
})