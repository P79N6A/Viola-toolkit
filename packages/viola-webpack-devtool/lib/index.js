// const args = require('yargs').argv
const ViolaDebug = require('viola-debugger')
const path = require('path')
const MemoryFS = require('memory-fs');
const webpack = require('webpack');

function violaDevtool(options, config) {
	const fs = new MemoryFS();

	if (options.output.filename) {
    options.output.filename = '[name].js'
  }

	const compiler = webpack(options)

	compiler.outputFileSystem = fs

	const devSeverConfig = options.devServer || Object.create(null)
	
	const serveConfig = {
		...devSeverConfig,
		...config
	}

	let ViolaDebugServer = null

	compiler.watch({
		aggregateTimeout: 300,
		poll: undefined
	}, (err, stats) => {
		if (err) {
			throw new Error(err)
		}

		if (!ViolaDebugServer) {
			ViolaDebugServer = ViolaDebug.startServer({
				port: 8086,
				targets: transform(options.entry, options.output),
				autoOpen: true,
				multipleChannel: false,
				fs,
				...serveConfig
			})
		} else {
			const peers = ViolaDebugServer.defaultChannel.peers
			Object.keys(peers).forEach(peerId => {
				let page = peers[peerId].debugPage
				page && page.refresh()
			})
		}
	});
}

function transform(entry, output) {
	return Object.keys(entry).reduce((res, name) => {
		res.push(path.resolve(output.path, output.filename.replace('[name]', name)))
		return res
	}, [])
}

module.exports = violaDevtool