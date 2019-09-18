import Vue from 'vue'
import Router from 'vue-router'
import About from './views/About'
import TableDiagrams from './views/TableDiagrams'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/about',
      component: About
    },
    {
      path: '/',
      component: TableDiagrams
    }
  ]
})
