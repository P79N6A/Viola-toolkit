import defaultFnc from '@tencent/viola-framework'
import {
  query
} from '../util'

let {
  init,
  createInstanceCtx,
  getFramework,
  createInstance
} = defaultFnc

init()

window.createInstance = createInstance
window.instanceId = parseInt(Math.random() * 100)

const CTX = createInstanceCtx(instanceId, {
  url: 'test',
  param: { test: 1 }
})

const fwName = query.get('fw') || 'vue'
const fw = getFramework(`/** @fw ${fwName} */`)

fw.intoCTX && fw.intoCTX(CTX)

Object.keys(CTX).forEach(key => {
  if (key !== 'document') {
    window[key] = CTX[key]
  } else {
    window['_doc'] = window['_document'] = CTX[key]
  }
})