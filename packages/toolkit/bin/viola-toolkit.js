#!/usr/bin/env node

const program = require('commander');
const minimist = require('minimist')

program
  .version(require('../package').version)
  .usage('<command> [options]')

program
  .command('debug <plugin> [pluginOptions]')
  .description('install a plugin and invoke its generator in an already created project')
  .option('-p <port> | --port <port>', 'description test', 8080)
  .allowUnknownOption()
  .action((plugin, pluginOptions, cmd) => {
    console.log(plugin)
    console.log(pluginOptions)
    console.log(minimist(process.argv.slice(3)))
    // console.log
  })

// 处理参数
program.parse(process.argv)

// 提供帮助信息
if (!program.args.length) {
  program.help()
}