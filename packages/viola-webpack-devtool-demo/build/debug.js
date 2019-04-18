const args = require('yargs').argv
const common = require('./webpack.common.js')
const merge = require('webpack-merge')
const packup = require('./build')
const ViolaDebug = require('@tencent/viola-webpack-devtool')
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

ViolaDebug(options)