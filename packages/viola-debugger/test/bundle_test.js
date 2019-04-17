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
var divDom = null
var k = 'debugger_cache'
var C = viola.requireAPI('cache')

// error occur at First
// C.fakeErrorApi()
// throw new Error('error occur at First')

if (C && C.getItem) {
  C.getItem(k, function (res) {
    if (res) {
      if (/^#/.test(res)) {
        if (textDom) {
          textDom.setText('Last Color: ' + res.toString())
          divDom.setStyle({
            backgroundColor: res
          })
        }
      }
    }
    // error occur in a callback
    // throw new Error('Error occur in a callback, it still createBody')
  })

  // error occur after a callNative
  // throw new Error('error occur after a callNative!!')

  init('loading cache')

} else {
  init('No Cache')
}

function init (text) {
  viola.document.body.appendChild(divDom = viola.document.createElement('div', {
    style: {
      width: 750,
      height: 600,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'blue'
    },
    events: {
      click: function (e) {
        var color = randomColor()
        this.setStyle({
          backgroundColor: color
        })
        tip(color)
        textDom.setText(color.replace(/^#/, '# '))
        C.setItem(k, color)
        // Error in fireEvent
        // throw new Error('Error in fireEvent')
      }
    },
    children: [(textDom = viola.document.createTextNode(text, {
      style: {
        fontSize: '20dp',
        color: 'white'
      }
    })), viola.document.createTextNode('typeof Vue:' + typeof Vue, {
      style: {
        fontSize: '15dp',
        color: 'white'
      }
    })]
  }))
  
  viola.on('update', (e)=>{
    console.info('hahaha', e)
  })
  
  viola.on('destroy', (e) => {
    console.info('destroy asd')
  })
  
  viola.document.render()
}
