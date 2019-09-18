<template>
  <v-row>
    <v-col>
      <v-list>
        <v-subheader>
          Visualizers
          <span v-show="modelFile">&nbsp;for {{ modelFile }}</span>
        </v-subheader>
        <v-list-item-group>
          <v-list-item
            v-for="(vizData, i) in visualizerData"
            v-bind:key="i"
          >
            <v-list-item-content>
              <router-link v-bind:to="vizData.link">
                {{ vizData.text }}
              </router-link>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'TableVisualizers',
  props: {
    modelFile: {
      type: String,
      default: '',
      required: false
    }
  },
  data () {
    return {
      visualizers: ['Topology', 'Dependency', 'Dependency2', 'Nested']
    }
  },
  computed: {
    visualizerData () {
      return this.visualizers.map(v => ({
        text: v,
        link: this.modelFile
          ? `/target/${this.modelFile}/${v.toLowerCase()}`
          : `/visualizer/${v.toLowerCase()}`
      }))
    }
  }
}
</script>

<style scoped>

</style>
