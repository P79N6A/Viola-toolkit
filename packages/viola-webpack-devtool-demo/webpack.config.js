const path = require('path')

const __root = __dirname
module.exports = {
  entry: {
    image: './src/pages/image'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__root, 'dist')
  },
  node: false,  // 关闭 webpack 对 node api接口的 polyfill
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: '@tencent/viola-vue-loader',
        options: {
          buble: {
            objectAssign: 'Object.assign'
          }
        }
      },
      {
        test: /\.js$/,
        loader: 'buble-loader',
        include: path.join(__root, 'src'),
        options: {
          objectAssign: 'Object.assign'
        }
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
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
      'mqq': '@tencent/viola-mqq',
      'associate': '@tencent/viola-associate'
    }
  },
  devServer: {
    chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
}