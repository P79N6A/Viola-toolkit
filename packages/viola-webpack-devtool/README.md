# `@tencent/viola-webpack-devtool`

> TODO: description

## Usage

``` javascript
const violaWebpackDevtool = require('@tencent/viola-webpack-devtool');

violaWebpackDevtool(WebpackConfig)
```

### setup DevServer Config

``` javascript
module.exports = {
  mode: 'development',
  watch: true,
  devServer: {
    port: 8085,
    open: true,
    chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
}
```

- `port`: `Number`

  port for dev server to listen

- `open`: `Boolean`

  if open the debug page

- `chromePath`: `String`

  **Required**, the path for executing chrome installed in local

### Using in Cli

``` json
{
  "scripts": {
    "debug": "viola-webpack-devtool --config webpack.config.js"
  }
}
```