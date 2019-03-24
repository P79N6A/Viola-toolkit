import {
  query
} from '../util'

if (query.has('pageId')) {
  insertScript(`/getBundle/${query.get('pageId')}`)
}

function insertScript(url) {
  let script = document.createElement('script')
  script.src = url
  document.body.appendChild(script)
}