function parseToBoolean (value) {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    return value !== 'false'
  }
  return !!value
}

module.exports = {
  parseToBoolean
}