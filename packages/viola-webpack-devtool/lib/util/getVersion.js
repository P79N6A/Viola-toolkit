function getVersions() {
  return (
    `viola-webpack-devtool ${require('../../package.json').version}\n` +
    `webpack ${require('webpack/package.json').version}`
  );
}

module.exports = getVersions;