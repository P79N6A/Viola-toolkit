// import {
//   query
// } from '../util'

// if (query.has('pageId')) {
//   insertScript(`/getBundle/${query.get('pageId')}`)
// }

export function insertScriptUrl(url) {
  let script = document.createElement('script')
  script.src = url
  document.body.appendChild(script)
}

export function insertScriptText (scriptText) {
  let script = document.createElement('script')
  script.textContent = scriptText
  document.body.appendChild(script)
}

export function fetchScript (url) {
  return fetch(url)
    .then((response) => {
      return response.text()
    })
    .catch(e => {
      throw new Error(e)
    })
}