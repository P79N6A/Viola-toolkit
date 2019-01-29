const QRCode = require('qrcode')

const $ = (s) => document.querySelector(s)

const $app = $('#app')
// const $$ = (s) => document.querySelectorAll(s)

const searchParams = new URLSearchParams(location.search);

const configList = [
  'ip',
  'debugJS',
  'ws',
  'pages'
]

const config = configList.reduce((config, c) => {
  value = searchParams.has(c) ? searchParams.get(c) : undefined
  if (c === 'pages') {
    config[c] = JSON.parse(value)
  } else {
    config[c] = value
  }
  return config
}, Object.create(null))

genQRCode(config)

function genQRCode (config) {
  let pages = config.pages
  let pageIdList = Object.keys(pages)
  let docFrag = document.createDocumentFragment()
  let count = pageIdList.length
  pageIdList.forEach(pageId => {
    let url = `${config.debugJS}?ws=${config.ws}&pageId=${pageId}`
    QRCode.toCanvas(url, (error, canvas) => {
      if (error) throw error
      let link = document.createElement('a')
      link.href = url
      link.title = url
      link.appendChild(canvas)
      link.appendChild(document.createTextNode(pages[pageId]))
      docFrag.appendChild(link)
      if(!(--count)) {
        renderQRCode(docFrag)
      }
    })
  })
}

/**
 * 
 * @param {DocumentFragment} docFrag 
 */
function renderQRCode (docFrag) {
  $app.appendChild(docFrag)
}
