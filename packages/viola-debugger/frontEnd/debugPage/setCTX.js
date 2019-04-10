import defaultFnc from '@tencent/viola-framework'

import {
  query
} from '../util'

import {
  fetchScript,
  insertScriptText
} from './getResource'

import modules from './module'
import cmp from './cmp'

let {
  init,
  createInstanceCtx,
  getFramework,
  createInstance,
  runCodeInCtx
} = defaultFnc

init()

registerModules(modules)
registerComponent(cmp)

if (typeof ViolaEnv === 'undefined') {
  console.warn('NO ViolaEnv')
  window.ViolaEnv = {
    platform: 'iOS',
    osVersion: '10.0.1',
    appName: 'violaDemo',
    appVersion: '0.1.0',
    deviceWidth: '750',
    deviceHeight: '800',
    deviceModel: '7s',
    dpToPxRatio: '2',
    orientation: 'landscape',
    iphoneX: 1,
    statusBarHeight: '36'
  }
} else {
  console.info('ViolaEnv: ', ViolaEnv)
}

// instance data
if (typeof __CREATE_INSTANCE__ === 'undefined') {
  console.warn('NO __CREATE_INSTANCE__ DATA')
  window.__CREATE_INSTANCE__ = {
    instanceId: parseInt(Math.random() * 100),
    pageData: {
      url: ''
    }
  }
} else {
  console.info('__CREATE_INSTANCE__: ', __CREATE_INSTANCE__)
}

// viola instance
const CTX = createInstanceCtx(__CREATE_INSTANCE__.instanceId, __CREATE_INSTANCE__.pageData)

runCode()

// const fwName = query.get('fw') || 'vue'
// const fw = getFramework(`/** @fw ${fwName} */`)

// // running Code
// fw.intoCTX && fw.intoCTX(CTX)

// Object.keys(CTX).forEach(key => {
//   if (key !== 'document') {
//     window[key] = CTX[key]
//   } else {
//     window['_doc'] = window['_document'] = CTX[key]
//   }
// })

function runCode () {
  if (query.has('pageId')) {
    let url = `/getBundle/${query.get('pageId')}`
    fetchScript(url)
      .then(scriptText => {
        const fw = getFramework(scriptText)
        console.log(fw)
        // running Code
        fw.intoCTX && fw.intoCTX(CTX)

        Object.keys(CTX).forEach(key => {
          if (key !== 'document') {
            window[key] = CTX[key]
          } else {
            window['_doc'] = window['_document'] = CTX[key]
          }
        })

        insertScriptText(scriptText)
      })
      .catch(e => {
        console.error(e)
      })
  }
}