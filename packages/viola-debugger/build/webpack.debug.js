const path = require('path')
module.exports = {
  mode: 'none',
  entry: path.resolve(__dirname, '../debugJS/index.js'),
  output: {
    path: path.resolve(__dirname, '../static'),
    filename: 'debug.js'
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
  }
}