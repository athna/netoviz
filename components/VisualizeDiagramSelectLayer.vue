<template>
  <v-select
    v-model="selectedLayers"
    v-bind:items="wholeLayers"
    v-on:change="displaySelectedLayers"
    chips
    deletable-chips
    multiple
  />
</template>

<script>
import { select } from 'd3-selection'

export default {
  props: {
    wholeLayers: {
      type: Array,
      required: true
    }
  },
  data: () => ({ selectedLayers: [] }),
  computed: {
    notSelectedLayers() {
      return this.wholeLayers.filter(
        layer => !this.selectedLayers.includes(layer)
      )
    }
  },
  watch: {
    wholeLayers() {
      // watch it because it will be set after drawJsonModel()
      // in VisualizeDiagramTopology component (after mounted()).
      this.selectedLayers = this.wholeLayers
    },
    selectedLayers() {
      this.displaySelectedLayers()
    }
  },
  methods: {
    setLayerDisplayStyle(layers, display) {
      for (const layer of layers) {
        select(`[id='${layer}-container']`).style('display', display)
      }
    },
    displaySelectedLayers() {
      // set display style of selecte(or not) layers
      this.setLayerDisplayStyle(this.selectedLayers, 'block')
      this.setLayerDisplayStyle(this.notSelectedLayers, 'none')
    }
  }
}
</script>

<style scoped></style>
