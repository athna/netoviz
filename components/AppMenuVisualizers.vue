<template>
  <v-menu open-on-hover offset-y>
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" elevation="0">
        Visualizers
        <v-icon right>
          mdi-menu-down
        </v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(visualizer, index) in visualizers"
        v-bind:key="index"
        v-bind:to="selectRoute(visualizer.value)"
      >
        {{ visualizer.text }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['visualizers'])
  },
  methods: {
    selectRoute(visualizer) {
      if (this.$route.path.match(new RegExp('/model/.*'))) {
        const modelFile = this.$route.params.modelFile
        return `/model/${modelFile}/${visualizer}`
      } else if (this.$route.path.match(new RegExp('/visualizer/.*/.*'))) {
        const modelFile = this.$route.params.modelFile
        return `/visualizer/${visualizer}/${modelFile}`
      }
      return `/visualizer/${visualizer}`
    }
  }
}
</script>

<style scoped></style>
