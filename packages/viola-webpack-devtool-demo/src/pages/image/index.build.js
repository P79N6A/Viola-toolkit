import cmp from '@pages/image'

require('@util/log')

new Vue({
  el: '#app',
  components: { cmp },
  render: (h) => h(cmp)
})