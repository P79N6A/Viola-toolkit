const log = require('./log')
const fs = require('fs')

function saveArrayData (path, arrayData) {
  fs.writeFile(path, JSON.stringify(arrayData), 'utf8', (err) => {
    if (err) {
      log.title('saveArrayData ERROR').error(err)
    } else {
      log.title('saveArrayData SUCCESS').info(path);
    }
  });
}

module.exports = {
  saveArrayData
}