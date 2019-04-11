import cmp from '@pages/<% entry %>'

require('@util/log')

new Vue({
  el: '#app',
  components: { cmp },
  render: (h) => h(cmp)
})