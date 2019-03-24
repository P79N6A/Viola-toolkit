const webpack = require("webpack");
const path = require('path');
const EventEmitter = require('events');

class Builder extends EventEmitter {
  constructor () {
    super()
    this.compiler = null
    this.watching = null
  }
  watch (config) {
    this.build(config)
    this.watching = this.compiler.watch({
      // watchOptions
      aggregateTimeout: 300,
      poll: undefined
    }, (err, stats) => {
      if (err) {
        console.error(err)
      } else {
        this.emit('watchUpdate', stats)
      }
    });
  }
  build (config) {
    /**
     * @todo merge config
     */
    this.compiler = webpack({
      entry: path.resolve(__dirname, "../index"),
      output: {
        path: path.resolve(__dirname, "../static/temp"),
        filename: 'bundle.js'
      },
      mode: 'development'
    })
  }
  close () {
    this.watching.close(() => {
      this.emit('watchClose')
    });
  }
}

module.exports = Builder