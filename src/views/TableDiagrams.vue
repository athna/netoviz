<template>
  <v-row>
    <v-col>
      <v-data-table
        caption="Select model/visualizer"
        v-bind:headers="headers"
        v-bind:items="diagrams"
      >
        <template v-slot:item="props">
          <tr>
            <td
              v-for="col in Object.keys(props.item)"
              v-bind:key="col"
            >
              <router-link v-bind:to="props.item[col].link">
                {{ props.item[col].text }}
              </router-link>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'TableDiagrams',
  data () {
    return {
      models: [],
      visualizers: ['Topology', 'Dependency', 'Dependency2', 'Nested']
    }
  },
  computed: {
    headers () {
      const head = [{ text: 'Model', value: 'model', link: '' }]
      return head.concat(this.visualizers.map(v => ({
        text: v,
        value: v.toLowerCase(),
        sortable: false,
        link: `/visualizer/${v.toLowerCase()}` // TODO: linked header
      })))
    },
    diagrams () {
      const rows = []
      for (const model of this.models) {
        const row = {
          model: {
            text: model.label,
            value: model.file,
            link: `/target/${model.file}`
          }
        }
        for (const visualizer of this.visualizers) {
          const vKey = visualizer.toLowerCase()
          row[vKey] = {
            text: visualizer,
            value: vKey,
            link: `/target/${model.file}/${vKey}`
          }
        }
        rows.push(row)
      }
      return rows
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
        console.log('[TableDiagrams] Cannot get models data: ', error)
      }
    }
  }
}
</script>

<style scoped>

</style>
