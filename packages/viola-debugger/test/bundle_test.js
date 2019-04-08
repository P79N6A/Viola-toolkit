viola.document.body.appendChild(viola.document.createElement('div', {
  style: {
    width: 750,
    height: 600,
    backgroundColor: 'yellow'
  },
  events: {
    click: function (e) {
      var color = 'red'
      if (this.style.backgroundColor === 'red') {
        color = 'yellow'
      }
      this.setStyle({
        backgroundColor: color
      })
      tip(JSON.stringify(e.frame))
    }
  }
}))

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

viola.on('update', (e)=>{
  console.info('hahaha', e)
})

viola.on('destroy', (e) => {
  console.info('destroyhghg asd')
})

viola.document.render()