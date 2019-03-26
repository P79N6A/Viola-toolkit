const {
  genFncId
} = require('./cbManager')

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

function alert (text) {
  var b = viola.requireAPI('bridge')
  b.invoke({
    ns: 'ui',
    method: 'showDialog',
    params: {
      title: '提示',
      text,
      needOkBtn: true,
      okBtnText: '确定'
    }
  })
}

function confirm (text, succ, cancel) {
  var b = viola.requireAPI('bridge')
  let params = {
    title: '提示',
    text,
    needOkBtn: true,
    okBtnText: '确定',
    needCancelBtn: false,
    cancelBtnText: '取消'
  }
  if (cancel) {
    params['needCancelBtn'] = true
  }
  b.invoke({
    ns: 'ui',
    method: 'showDialog',
    params
  }, genFncId(function(result) {
    if (cancel) {
      if (result.data.button == 1) {
        succ()
      } else {
        cancel()
      }
    } else {
      succ()
    }
  }))
}

module.exports = {
  query: query(),
  confirm,
  alert
}