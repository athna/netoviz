import Vue from 'vue'
import App from './App.vue'
import store from './store'
import './plugins/element.js'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
