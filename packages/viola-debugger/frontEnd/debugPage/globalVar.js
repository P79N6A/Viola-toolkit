window.ENV = 'web'

window.__DEBUG__ = true

window.ViolaEnv = {
  platform: 'iOS'
}

window.Promise = undefined
window.MessageChannel = undefined
window.Set = undefined

window.$update = {
  appear() {
    window.updateInstance(window.instanceId, {
      viewDidAppear: 1
    })
  },
  disappear() {
    window.updateInstance(window.instanceId, {
      viewDidDisappear: 1
    })
  },
  pass(p) {
    window.updateInstance(window.instanceId, p)
  }
}

window.$destroy = (id) => {
  window.destroyInstance(id || window.instanceId)
}

window.callNative = function (id, tasks) {
  console.log('i got it')
  console.log('id: ' + id)
  console.log('task', tasks)
  // var t = JSON.stringify(tasks)
  // wsTask.push(t)
  // wsOpen && ws.send(t)
  // var currentTask = tasks[0]
  // var { module, args, method, component } = currentTask
  // cmdList.append(currentTask)
  // switch (module) {
  //   case MODULE.DOM:
  //     domModule[method](args)
  //     break;
  //   default:
  //     console.info('not support now')
  // }
};