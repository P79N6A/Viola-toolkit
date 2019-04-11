const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')
const __root = path.resolve(__dirname, '../')

module.exports = {
  mode: 'production',
  output: {
    path: path.resolve(__root, 'dist/prod')
  },
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(true),
      IP_ADDR: JSON.stringify('')
    })
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            "drop_console": true
          }
        }
      })
    ]
  }
}