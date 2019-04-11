const webpack = require('webpack')
const { getIp } = require('./util')

module.exports = {
  mode: 'development', // development 的格式对我们似乎比较不方便 ？？
  watch: true,
  watchOptions: {
    // 不监听的文件或文件夹
    ignored: /node_modules/,
    // 监听到变化发生后会等300ms再去执行动作，防止文件更新太快导致重新编译频率太高
    aggregateTimeout: 300,
    // 判断文件是否发生变化是通过不停的去询问系统指定文件有没有变化实现的
    // 默认每秒轮询1000次
    // poll: 1000
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(false),
      IP_ADDR: JSON.stringify(getIp())
    })
  ],
  devServer: {
    port: 8085,
    open: true,
    chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
}