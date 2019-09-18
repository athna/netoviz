import Vue from 'vue'
import Vuex from 'vuex'
import { json } from 'd3-fetch'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    visualizer: 'Dependency2',
    modelFile: '', // not selected
    wholeLayers: [],
    currentAlertRow: { id: -1 },
    alertHost: ''
  },
  mutations: {
    setVisualizer (state, payload) {
      state.visualizer = payload
    },
    setModelFile (state, payload) {
      state.modelFile = payload
    },
    setWholeLayers (state, payload) {
      state.wholeLayers = payload
    },
    setCurrentAlertRow (state, payload) {
      state.currentAlertRow = payload
    },
    setAlertHost (state, payload) {
      state.alertHost = payload
    }
  },
  getters: {
    visualizer (state) {
      return state.visualizer
    },
    modelFile (state) {
      return state.modelFile
    },
    wholeLayers (state) {
      return state.wholeLayers
    },
    currentAlertRow (state) {
      return state.currentAlertRow
    },
    alertHost (state) {
      return state.alertHost
    }
  },
  actions: {
    updateModelFile ({ commit, dispatch }, payload) {
      // payload = model (json) file name
      commit('setModelFile', payload)
      dispatch('initializeLayersFromModelFile')
    },
    initializeLayersFromModelFile ({ getters, commit }) {
      const modelFile = getters.modelFile
      json(`/graph/topology/${modelFile}`).then(
        modelData => {
          // graph object data to draw converted from topology json
          const layers = modelData.map(d => d.name)
          commit('setWholeLayers', layers)
        },
        error => {
          throw error
        }
      )
    }
  }
})
