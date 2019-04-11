const webpack = require("webpack")

// write info in terminal
function write (err, stats) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error('errors');
    console.error(info.errors);
  }

  if (stats.hasWarnings()) {
    console.error('warning');
    console.warn(info.warnings);
  }

  console.log(stats.toString({
    entrypoints: false,
    colors: true    // 在控制台展示颜色
  }));
}

// export webpack
module.exports = function packup(config) {
  const compiler = webpack(config, write);
  return compiler
}