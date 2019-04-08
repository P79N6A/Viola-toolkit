const {
  query,
  confirm,
  alert
} = require('./util')

const MSG_TYPE = require('../server/const/native')

const {
  genFncId,
  isDebugJSFncId,
  actFncById
} = require('./cbManager')

var websocket = viola.requireAPI('webSocket')

websocket.sendTask = function sendTask(type, data) {
  this.send(JSON.stringify({
    type, data
  }))
}

var old = viola.tasker.receive

viola.tasker.receive = function (tasks) {
  if (!Array.isArray(tasks)) {
    // transform to Array from String
    tasks = JSON.parse(tasks)
  }
  // throw new Error(JSON.stringify(tasks))
  var t = tasks[0]

  if (Array.isArray(t.args) && t.args.length) {
    let fncId = t.args[t.args.length - 1]
    if (isDebugJSFncId(fncId)) {
      actFncById(fncId, t.data)
    } else {
      websocket.sendTask(MSG_TYPE.CALL_JS, {
        task: [t]
      })
    }
  }
}

var isCreateBody = 0,
    isReloading = 0,
    realBodyRef = -1,
    fakeBodyRef = viola.document.body.ref

var pendingTask = []


var wsUrl =  query.ws + query.peerId
// throw new Error(wsUrl)
websocket.WebSocket(`ws://${wsUrl}`,'');
websocket.onopen(genFncId(function (e){
  websocket.isOpen = 1
  websocket.sendTask('login', {
    ViolaEnv,
    viola: {
      instanceId: viola.getId(),
      pageData: viola.pageData
    }
  })
  var task = null
  while (task = pendingTask.shift()) {
    websocket.sendTask(task.type, task.data)
  }
}));
// error
websocket.onerror(genFncId(function (e){
  throw new Error(e)
}));
// close
websocket.onclose(genFncId(function (e){
  onWSClose()
}));

websocket.onmessage(genFncId(function (e){
  var {type, data} = JSON.parse(e.data);
  switch (type) {
    case MSG_TYPE.CLOSE:
      onWSClose()
      break
    case MSG_TYPE.ERROR:
      pageError(data)
      break
    case MSG_TYPE.RELOAD:
      pageReload()
      break
    case MSG_TYPE.CALL_NATIVE:
      callNative(data)
  }
}))

function onWSClose () {
  if (isReloading) return
  confirm('链接已停止', () => {
    viola.requireAPI('bridge').invoke({
      ns: 'ui',
      method: 'popBack',
    })
  })
}

function pageError (e) {
  alert(e)
}

function pageReload (e) {
  if (isCreateBody) {
    isReloading = 1
    var reload = viola.requireAPI('navigation').reloadPage
    reload && reload()
  }
}

function callNative (data) {
  if (isReloading) return
  let hasRM = 0
  if (data[0].method == 'createBody') {
    if (!isCreateBody) {
      isCreateBody = 1
    } else {
      // hasRM = 1
      // viola.tasker.sendTask([{
      //   module: 'dom',
      //   method: 'removeElement',
      //   args: [realBodyRef]
      // }])
      // viola.document.body.setStyle({
      //   backgroundColor: 'green'
      // })
      // throw new Error(realBodyRef + '  ' + fakeBodyRef)
      // return
    }
    // realBodyRef = data[0].args.ref
    // viola.tasker.sendTask([{
    //   module: 'dom',
    //   method: 'addElement',
    //   args: [
    //     fakeBodyRef,
    //     data[0].args,
    //     0
    //   ]
    // }])
    // data[0] = {
    //   module: 'dom',
    //   method: 'addElement',
    //   args: [
    //     fakeBodyRef,
    //     data[0].args,
    //     0
    //   ]
    // }
  }
  viola.tasker.sendTask(data)
}

// viola.document.body.setStyle({
//   backgroundColor: 'transparent'
// })

viola.on('update', function update(args) {
  if (isReloading) {
    return
  } else {
    if (websocket.isOpen) {
      websocket.sendTask(MSG_TYPE.UPDATE_INSTANCE, {
        args
      })
    } else {
      pendingTask.push({
        type: MSG_TYPE.UPDATE_INSTANCE,
        data: { args }
      })
    }
  }
})

viola.on('destroy', function destroy(args) {
  if (isReloading) return
  websocket.sendTask(MSG_TYPE.DESTROY_INSTANCE, {
    args
  })
})

// var reload = viola.requireAPI('navigation').reloadPage
//       reload && reload()

// viola.document.render()