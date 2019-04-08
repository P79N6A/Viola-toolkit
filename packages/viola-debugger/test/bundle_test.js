viola.document.body.appendChild(viola.document.createElement('div', {
  style: {
    width: 750,
    height: 600,
    backgroundColor: 'yellow'
  },
  events: {
    click (e) {
      // console.log(e)
      this.setStyle({
        backgroundColor: 'yellow'
      })
      tip(JSON.stringify(e.frame))
      // var reload = viola.requireAPI('navigation').reloadPage
      // reload && reload()
      // e.stopPropagation()
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