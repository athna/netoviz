<template>
  <v-row>
    <v-col>
      <v-list>
        <v-subheader>
          Models
          <span v-show="visualizer">&nbsp;with {{ visualizer }}</span>
        </v-subheader>
        <v-list-item-group>
          <v-list-item
            v-for="(mData, i) in modelData"
            v-bind:key="i"
            v-bind:href="mData.link"
          >
            {{ mData.text }}
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'TableModels',
  props: {
    visualizer: {
      type: String,
      default: '',
      required: false
    }
  },
  data () {
    return {
      models: []
    }
  },
  computed: {
    modelData () {
      return this.models.map(m => ({
        text: m.label,
        link: this.visualizer
          ? `/visualizer/${this.visualizer}/${m.file}`
          : `/target/${m.file}`
      }))
    }
  },
  mounted () {
    // TODO: models data must be managed by Vuex
    this.getModels()
  },
  methods: {
    async getModels () {
      try {
        const response = await fetch('/models')
        this.models = await response.json()
        this.modelFile = this.models[0].file // default
      } catch (error) {
        console.log('[TableModels] Cannot get models data: ', error)
      }
    }
  }
}
</script>

<style scoped>

</style>
