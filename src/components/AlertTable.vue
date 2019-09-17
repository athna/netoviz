<template>
  <div>
    <v-row>
      <v-col>
        <v-btn
          rounded
          color="warning"
          v-bind:disabled="disableClearAlertTableButton"
          v-on:click="clickClearSelectionButton"
        >
          <v-icon left>
            mdi-notification-clear-all
          </v-icon>
          Clear Selection
        </v-btn>
      </v-col>
      <v-col>
        <v-text-field
          v-model="alertHostInput"
          clearable
          flat
          label="Highlight Host"
          placeholder="Host Name"
          v-on:input="inputAlertHost"
        />
      </v-col>
      <v-col>
        <v-switch
          v-model="enableTimer"
          inset
          label="Alert Polling"
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model="alertPollingInterval"
          flat
          label="Polling Interval (sec)"
          type="number"
          min="1"
          v-on:change="resetAlertCheckTimer"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div id="alert-table">
          <v-data-table
            dense
            v-bind:headers="alertTableHeader"
            v-bind:items="alerts"
            v-bind:items-per-page="5"
          >
            <template v-slot:top>
              <div id="updated-time">
                Log updated:
                <span style="background-color: lightgoldenrodyellow">
                  {{ alertUpdatedTime }}
                </span>
              </div>
            </template>
            <template v-slot:item="props">
              <tr
                v-bind:class="{ 'info': props.item.id === currentAlertRow.id }"
                v-on:click="handleAlertTableCurrentChange(props.item)"
              >
                <td>{{ props.item.id }}</td>
                <td>
                  <v-chip
                    v-bind:color="severityColor('fill', props.item.severity)"
                    v-bind:text-color="severityColor('text', props.item.severity)"
                  >
                    {{ props.item.severity }}
                  </v-chip>
                </td>
                <td>{{ props.item.host }}</td>
                <td>{{ props.item.date }}</td>
              </tr>
            </template>
          </v-data-table>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div v-bind:style="{ display: debug }">
          <ul>
            <li>alert host input: {{ alertHostInput }}</li>
            <li>enable polling?: {{ enableTimer }}</li>
            <li>polling interval: {{ alertPollingInterval }}</li>
            <li>current alert row: {{ currentAlertRow }}</li>
          </ul>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { debounce } from 'debounce'
import colors from 'vuetify/lib/util/colors'

export default {
  data () {
    return {
      alerts: [],
      alertLimit: 15,
      alertPollingInterval: 10, // default: 10sec
      alertCheckTimer: null,
      alertUpdatedTime: null,
      alertHostInput: '',
      alertTableHeader: [
        { text: 'ID', sortable: true, value: 'id' },
        { text: 'Severity', sortable: true, value: 'severity' },
        { text: 'Host', sortable: true, value: 'host' },
        { text: 'Date', sortable: true, value: 'date' }
      ],
      unwatchAlertHost: null,
      fromAlertHostInput: false,
      enableTimer: true,
      debug: 'none' // 'none' or 'block' to appear debug container
    }
  },
  computed: {
    currentAlertRow: {
      get () {
        return this.$store.getters.currentAlertRow
      },
      set (value) {
        this.$store.commit('setCurrentAlertRow', value)
      }
    },
    alertHost: {
      get () {
        return this.$store.getters.alertHost
      },
      set (value) {
        this.$store.commit('setAlertHost', value)
      }
    },
    disableClearAlertTableButton () {
      return (
        this.currentAlertRow && Object.keys(this.currentAlertRow).length < 1
      )
    }
  },
  watch: {
    enableTimer () {
      this.setAlertCheckTimer()
    }
  },
  mounted () {
    this.updateAlerts() // initial data
    this.startAlertCheckTimer()
    this.unwatchAlertHost = this.$store.watch(
      state => state.alertHost,
      (newHost, oldHost) => {
        this.alertHostInput = newHost
        this.inputAlertHost()
      }
    )
  },
  beforeDestroy () {
    this.unwatchAlertHost()
    this.stopAlertCheckTimer()
  },
  methods: {
    setAlertCheckTimer () {
      this.enableTimer
        ? this.startAlertCheckTimer()
        : this.stopAlertCheckTimer()
    },
    resetAlertCheckTimer () {
      this.stopAlertCheckTimer()
      this.setAlertCheckTimer()
    },
    stopAlertCheckTimer () {
      clearInterval(this.alertCheckTimer)
      this.alertCheckTimer = null
    },
    startAlertCheckTimer () {
      this.alertCheckTimer = setInterval(() => {
        this.updateAlerts()
      }, this.alertPollingInterval * 1000) // sec
    },
    updateAlerts () {
      // update alerts and select head data
      // console.log('updateAlerts: ', new Date())
      this.requestAlertData().then(() => {
        // console.log('[AlertTable] updateAlerts')
        this.alertUpdatedTime = new Date()
        this.setAlertTableCurrentRow(this.alerts[0])
      })
    },
    async requestAlertData () {
      try {
        // console.log('[AlertTable] request alert data')
        const response = await fetch(`/alert/${this.alertLimit}`)
        const newAlerts = await response.json()
        // check alerts (alert table rows) update:
        // changed table rows OR comes new data(id)
        if (
          this.alerts.length !== newAlerts.length ||
          newAlerts[0].id !== this.alerts[0].id
        ) {
          this.alerts = newAlerts
        }
      } catch (error) {
        console.error('fetch alert failed: ', error)
      }
    },
    clickClearSelectionButton () {
      this.alertHostInput = ''
      this.setAlertTableCurrentRow({ id: -1 })
    },
    layerOfAlertHostInput () {
      if (this.alertHostInput && this.alertHostInput.match(new RegExp('(.+)__(.+)'))) {
        return this.alertHostInput.split('__').shift()
      }
      return null
    },
    alertFromAlertHostInput () {
      const alert = {
        id: -1, // clear alert table selection
        message: 'selected directly',
        severity: 'information',
        date: new Date().toISOString(),
        // for drill-down:
        // it must identify object that has same name with layer (path)
        layer: this.layerOfAlertHostInput()
      }
      alert.host = alert.layer
        ? this.alertHostInput.split('__').pop() // when 'layer__node' format
        : this.alertHostInput
      return alert
    },
    inputAlertHost: debounce(function () {
      // NOTICE: do not use arrow-function for debounce.
      this.fromAlertHostInput = true
      // set dummy alert to redraw diagram.
      this.setAlertTableCurrentRow(this.alertFromAlertHostInput())
      this.fromAlertHostInput = false
    }, 500), // 0.5sec
    setAlertTableCurrentRow (row) {
      // console.log('[AlertTable] set alert table current row: ', row)
      this.alertHostInput = row.host || ''
      this.currentAlertRow = row
    },
    handleAlertTableCurrentChange (row) {
      // console.log('[AlertTable] handle current change: ', row)

      // from 'update alert-table' or 'click alert-table'
      if (!this.fromAlertHostInput) {
        this.alertHostInput = row && row.host ? row.host : ''
        this.currentAlertRow = row
      }
      // from alert-host input:
      // when row is empty, it clear before redraw diagram (NOP).
      if (row && Object.keys(row).length > 0) {
        this.currentAlertRow = row
      }
    },
    severityColor (prop, severity) {
      const colorTable = [
        {
          severity: 'disaster',
          fill: colors.red.lighten1, // bright red
          text: colors.grey.lighten5
        },
        {
          severity: 'high',
          fill: colors.red.darken4, // red
          text: colors.grey.lighten5
        },
        {
          severity: 'average',
          fill: colors.orange.lighten1, // orange
          text: colors.grey.darken4
        },
        {
          severity: 'warning',
          fill: colors.yellow.accent3, // bright yellow
          text: colors.grey.darken4
        },
        {
          severity: 'information',
          fill: colors.lightGreen.darken1, // bright green
          text: colors.grey.lighten5
        }
      ]
      const defaultColorInfo = {
        severity: 'default',
        fill: colors.grey.darken1, // grey
        text: colors.grey.lighten5
      }
      const colorInfo = colorTable.find(d => d.severity === severity)
      return colorInfo ? colorInfo[prop] : defaultColorInfo[prop]
    }
  }
}
</script>

<style lang="scss" scoped>
tr.info {
  color: white;
  font-weight: bold;
}
</style>
