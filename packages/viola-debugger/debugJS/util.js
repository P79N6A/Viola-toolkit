function query() {
  var queryString = viola.pageData.url.split('?')[1]
  if (queryString) {
    return queryString.split('&').reduce((query, params) => {
      if (params) {
        var p = params.split('=')
        query[p[0]] = p[1]
      }
      return query
      }, Object.create(null))
  } else {
    return Object.create(null)
  }
}

module.exports = {
  query
}