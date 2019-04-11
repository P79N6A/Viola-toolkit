const args = require('yargs').argv
const common = require('./webpack.common.js')
const merge = require('webpack-merge')
const packup = require('./build')

const buildDir = args._

if (!buildDir || !Array.isArray(buildDir) || !buildDir.length) {
  console.warn(`
    building all pages.
  `)
}

// webpack common config
const commonConfig = common({
  entry: buildDir
})
console.log(`
  building now ~
`)

const compiler = packup(merge(commonConfig, require('./webpack.prod')))

compiler.run(() => {
  console.log(`
    building complete ~
  `)
})