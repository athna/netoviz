<template>
  <v-app id="app">
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <AppSelectModel />
      <AppSelectVisualizer />
    </v-navigation-drawer>

    <v-app-bar
      app
      dark
      dense
    >
      <v-app-bar-nav-icon v-on:click.stop="drawer = !drawer" />
      <v-toolbar-title>Netoviz</v-toolbar-title>
      <div class="flex-grow-1" />
      <AppBarLinkSource />
    </v-app-bar>

    <v-content>
      <v-container fluid>
        <AlertTable />
        <VisualizeDiagram />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import AppBarLinkSource from './components/AppBarLinkSource'
import AppSelectModel from './components/AppSelectModel'
import AppSelectVisualizer from './components/AppSelectVisualizer'
import AlertTable from './components/AlertTable'
import VisualizeDiagram from './components/VisualizeDiagram'

export default {
  name: 'App',
  components: {
    AppBarLinkSource,
    AppSelectModel,
    AppSelectVisualizer,
    AlertTable,
    VisualizeDiagram
  },
  data () {
    return {
      drawer: null
    }
  }
}
</script>

<style lang="scss">
svg {
  border: solid 1px;
  margin: 10px;
}
</style>
