const args = require('yargs').argv
const webConfig = require('./webpack.web.js')
const merge = require('webpack-merge')
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

console.log(`${(new Date()).toTimeString()} args: `, args._)

const buildDir = args._

if (!buildDir || !Array.isArray(buildDir) || !buildDir.length) {
  throw new Error(`
    web 模式请指定 page 目录:
    npm run web pageName
    `)
}
let config = webConfig({
  page: buildDir[0]
})
let compiler = webpack(config);

let server = new WebpackDevServer(compiler, config.devServer);

server.listen(config.devServer.port, "localhost", function () {});
