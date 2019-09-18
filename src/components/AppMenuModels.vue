<template>
  <v-menu
    open-on-hover
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn
        flat
        v-on="on"
      >
        Models
        <v-icon right>
          mdi-menu-down
        </v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(model, index) in models"
        v-bind:key="index"
        v-bind:to="`/target/${model.file}`"
      >
        {{ model.label }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data () {
    return {
      models: []
    }
  },
  mounted () {
    this.getModels()
  },
  methods: {
    async getModels () {
      try {
        const response = await fetch('/models')
        this.models = await response.json()
        this.modelFile = this.models[0].file // default
      } catch (error) {
        console.log('[SelectModel] Cannot get models data: ', error)
      }
    }
  }
}
</script>

<style scoped></style>
