const {
  parseToBoolean
} = require('../util/index')

module.exports = function inspect(program) {
  program
    .command('inspect <jsBundle> [otherJsBundle...]')
    .option('-p, --port <port>', 'custom dev server port', 8086)
    .option('-D, --devmode', 'debugger development mode')
    .option('-o, --open <open>', 'auto open browser', true)
    .option('-w, --watch', 'watch mode', false)
    .action(function (jsBundle, otherJsBundle, cmd) {
      const dirPath = process.cwd()
      const path = require('path')
      let config = Object.create(null)
      let _targets = [jsBundle].concat(otherJsBundle)
      config._inspectTargets = _targets
      config.targets = _targets.reduce((t, js) => {
        if (!(/\.js/.test(js))) {
          js += '.js'
        }
        t.push(path.resolve(dirPath, js))
        return t
      }, [])
      if (cmd.devmode) {
        process.env.DEVELOPMENT = true
      }
      config.port = cmd.port
      config.watch = parseToBoolean(cmd.watch)
      config.autoOpen = parseToBoolean(cmd.open)
      require('../../index').startServer(config)
    })
}