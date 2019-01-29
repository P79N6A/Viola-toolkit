const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'none',
  entry: {
    entry: path.resolve(__dirname, '../frontEnd/entry/index'),
    debug: path.resolve(__dirname, '../frontEnd/debugPage/index')
  },
  output: {
    path: path.resolve(__dirname, '../static/lib'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({  // Also generate a test.html
      // bundleSrc: '/lib/entry.js',
      chunks: ['entry'],
      filename: path.resolve(__dirname, '../static/entry.html'),
      template: path.resolve(__dirname, '../frontEnd/entry.html')
    }),
    new HtmlWebpackPlugin({
      chunks: ['debug'],
      filename: path.resolve(__dirname, '../static/debug.html'),
      template: path.resolve(__dirname, '../frontEnd/debug.html'),
      // inject: false
    })
  ]
}