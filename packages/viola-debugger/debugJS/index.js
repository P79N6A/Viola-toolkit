const {
  query
} = require('./util')

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
  var t = tasks[0]
  // if (t.module == 'webSocket') {
    old.call(viola.tasker, tasks)
  // }
  // websocket.send(JSON.stringify(t));
  websocket.sendTask('callJS', t)
}

var isCreateBody = 0
var wsUrl =  query.ws + query.channel
// throw new Error(wsUrl)
websocket.WebSocket(`ws://${wsUrl}`,'');
websocket.onopen(function (e){
  websocket.sendTask('login', {
    pageId: query.pageId,
    entryId: query.entryId,
    ViolaEnv,
    viola: {
      instanceId: viola.getId(),
      pageData: viola.pageData
    }
  })
});
websocket.onmessage(function (e){
  var {type, data} = JSON.parse(e.data);
  if (data[0].method == 'createBody') {
    viola.tasker.sendTask([{
      module: 'dom',
      method: 'addElement',
      args: [
        viola.document.body.ref,
        data[0].args,
        0
      ]
    }])
    // viola.requireAPI('bridge').invoke({
    //   ns: 'ui',
    //   method: 'showDialog',
    //   params: {
    //     title: 'alert',
    //     text: viola.document.body.ref,
    //     needOkBtn: true,
    //     needCancelBtn: false,
    //   }
    // })
    
    // viola.tasker.sendTask([{
    //   "module":"dom",
    //   "method":"addElement",
    //   "args": [
    //     viola.document.body.ref,
    //     {"ref":"1","type":"div","style":{"height":"200dp","backgroundColor":"black"}},
    //     0
    //   ]
    // }])
  } else {
    viola.tasker.sendTask(data)
  }
});
websocket.onerror(function (e){
  throw new Error(e)
});
websocket.onclose(function (e){
});

viola.document.body.setStyle({
  backgroundColor: 'green'
})

viola.document.render()