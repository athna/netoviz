import { select, selectAll } from 'd3-selection'
import BaseContainer from '../../../srv/graph/common/base'
import DiffState from '../../../srv/graph/common/diff-state'
import TooltipCreator from './tooltip-creator'

export default class SingleVisualizerBase extends BaseContainer {
  makeVisContainer () {
    // add div to keep compatibility with topology visualizer
    return select('body')
      .select('div#visualizer')
      .append('div')
      .attr('class', 'network-layer')
  }

  makeGraphSVG (svgId, svgClass, svgGroupId) {
    const origin = this.makeVisContainer()
    // Keep tooltip before at svg.
    // In topology viewer,
    // add inline-block div container (info-table) after svg.
    this.tooltip = this.makeToolTip(origin)
    this.svg = origin
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('id', svgId)
      .attr('class', svgClass)
    this.svgGrp = this.svg
      .append('g')
      .attr('id', svgGroupId)
  }

  objClassDef (obj, classString) {
    let objState = null
    if ('diffState' in obj) {
      const diffState = new DiffState(obj.diffState)
      objState = diffState.detect()
    } else {
      console.log(`object ${obj.type}: ${obj.path} does not have diffState`)
      console.log(obj)
    }
    const list = classString.split(' ').concat(objState)
    if (objState === this.currentInactive) {
      list.push('inactive')
    }
    return list.join(' ')
  }

  clearCanvas () {
    // clear graphs
    select('div#visualizer') // clear all graphs
      .selectAll('div.network-layer')
      .remove()
  }

  clearToolTip (originSelection) {
    originSelection
      .select('div.tool-tip')
      .remove()
  }

  makeToolTip (originSelection) {
    this.clearToolTip(originSelection)
    const toolTip = originSelection
      .append('div')
      .attr('class', 'tool-tip')
    return new TooltipCreator(toolTip)
  }

  makeClearHighlightButton () {
    const clearButtonFontSize = 12
    this.svg.append('text')
      .attr('id', 'clear-button')
      .attr('x', clearButtonFontSize / 2)
      .attr('y', clearButtonFontSize)
      .text('[Clear Highlight]')
  }

  makeToggleDiffButton () {
    const clearButtonFontSize = 12
    this.svg.append('text')
      .attr('id', 'diff-toggle-button')
      .attr('x', clearButtonFontSize / 2)
      .attr('y', clearButtonFontSize * 2.2)
      .text('[Toggle Diff Added/Deleted]')
  }

  makeGraphControlButtons () {
    this.makeClearHighlightButton()
    this.makeToggleDiffButton()
  }

  controlButtonMouseOverCallback (id) {
    return () => this.svg.select(id).classed('select-ready', true)
  }

  controlButtonMouseOutCallback (id) {
    return () => this.svg.select(id).classed('select-ready', false)
  }

  setClearHighlightButtonHandler (clickCallback) {
    const id = 'text#clear-button'
    this.svg.select(id)
      .on('click', clickCallback)
      .on('mouseover', this.controlButtonMouseOverCallback(id))
      .on('mouseout', this.controlButtonMouseOutCallback(id))
  }

  toggleActiveDiff () {
    const visualizer = selectAll('div#visualizer')
    visualizer.selectAll(`.${this.currentInactive}`)
      .classed('inactive', false)
      .classed('active', true)
    this.currentInactive = this.currentInactive === 'deleted' ? 'added' : 'deleted'
    visualizer.selectAll(`.${this.currentInactive}`)
      .classed('inactive', true)
      .classed('active', false)
  }

  setToggleDiffButtonHandler () {
    const id = 'text#diff-toggle-button'
    this.svg.select(id)
      .on('click', this.toggleActiveDiff)
      .on('mouseover', this.controlButtonMouseOverCallback(id))
      .on('mouseout', this.controlButtonMouseOutCallback(id))
  }

  setGraphControlButtons (clearHighlightClickCB) {
    this.setClearHighlightButtonHandler(clearHighlightClickCB)
    this.setToggleDiffButtonHandler()
  }

  childPathRegexp (path) {
    return new RegExp(`${path}__.*`)
  }

  matchChildPath (parentPath, targetPath) {
    return targetPath.match(this.childPathRegexp(parentPath))
  }

  typeOfPath (path) {
    const length = path.split('__').length
    if (length === 3) {
      return 'tp'
    } else if (length === 2) {
      return 'node'
    } else if (length === 1) {
      return 'network'
    }
    return 'error'
  }

  networkPathOf (path) {
    return path.split('__').shift() // head of path string
  }

  parentPathOf (path) {
    const paths = path.split('__')
    paths.pop() // remove latest path
    return paths.join('__')
  }
}
