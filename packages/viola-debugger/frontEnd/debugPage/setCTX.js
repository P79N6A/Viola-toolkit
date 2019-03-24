import defaultFnc from '@tencent/viola-framework'
import {
  query
} from '../util'

import modules from './module'

let {
  init,
  createInstanceCtx,
  getFramework,
  createInstance
} = defaultFnc

init()

registerModules(modules)

if (typeof __CREATE_INSTANCE__ === 'undefined') {
  window.__CREATE_INSTANCE__ = {
    instanceId: parseInt(Math.random() * 100),
    pageData: {}
  }
}

const CTX = createInstanceCtx(__CREATE_INSTANCE__.instanceId, __CREATE_INSTANCE__.pageData)

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