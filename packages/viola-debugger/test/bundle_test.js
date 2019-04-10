/** @fw Vanilla */
function tip(text) {
  viola.requireAPI('bridge').invoke({
    ns: 'ui',
    method: 'showTips',
    params: {
      text,
      iconMode: 1
    }
  })
}

function randomColor () {
  return '#' + ((1<<24) * Math.random()|0).toString(16)
}
var textDom = null
var k = 'debugger_cache'
var C = viola.requireAPI('cache')
if (C && C.getItem) {
  C.getItem(k, function (res) {
    if (res) {
      // init(res)
      if (textDom) {
        textDom.setText('Last: ' + res.toString())
      }
    }
  })
  init('loading cache')
} else {
  init('no cache')
}
// init('no cache')

function init (text) {
  viola.document.body.appendChild(viola.document.createElement('div', {
    style: {
      width: 750,
      height: 600,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#888888'
    },
    events: {
      click: function (e) {
        var color = randomColor()
        this.setStyle({
          backgroundColor: color
        })
        tip(color)
        textDom.setText(color.replace('#', '# '))
        C.setItem(k, color)
      }
    },
    children: [(textDom = viola.document.createTextNode(text, {
      style: {
        fontSize: '20dp',
        color: 'white'
      }
    }))]
  }))
  
  viola.on('update', (e)=>{
    console.info('hahaha', e)
  })
  
  viola.on('destroy', (e) => {
    console.info('destroyhghg asd')
  })
  
  viola.document.render()
}
