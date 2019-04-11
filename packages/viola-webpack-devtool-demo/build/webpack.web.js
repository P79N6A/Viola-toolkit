const path = require('path');
const webpack = require('webpack')
const { getIp } = require('./util')
const __root = path.join(__dirname, '../')


module.exports = (config = {}) => {
  return {
    entry: {
      App: path.join(__root, `src/pages/${config.page}/index.build.js`)
    },
    output: {
      path: path.join(__root, '__build__/'),
      filename: 'bundle.js',
      publicPath: '/__build__/'
    },
    node: false,
    resolve: {
      extensions: ['.vue', '.js', '.scss'],
      modules: [
        path.resolve(__root, 'src/style'),
        'node_modules'
      ],
      alias: {
        '@': path.resolve(__root, 'src/'),
        '@component': path.resolve(__root, 'src/component/'),
        '@scss': path.resolve(__root, 'src/style/'),
        '@pages': path.resolve(__root, 'src/pages/'),
        '@util': path.resolve(__root, 'src/util/'),
        '@mixins': path.resolve(__root, 'src/mixins/'),
        '@api': path.resolve(__root, 'src/api/'),
        '@constant': path.resolve(__root, 'src/constant/'),
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: '@tencent/viola-vue-loader',
          options: {
            buble: {
              objectAssign: 'Object.assign',
            }
          }
        },
        {
          test: /\.js$/,
          loader: 'buble-loader',
          include: path.join(__dirname, 'src'),
          options: {
            objectAssign: 'Object.assign',
          }
        }
      ]
    },
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      // new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(false),
        IP_ADDR: JSON.stringify(getIp())
      })
    ],
    devServer: {
      contentBase: './',
      hot: true,
      port: 8012,
      historyApiFallback: true,
      disableHostCheck: true,
      openPage: '/',
      open: true
    }
  }
} 
