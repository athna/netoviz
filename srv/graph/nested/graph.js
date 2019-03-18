import NestedGraphConstants from './constants'
import GridOperator from './grid-operator'
import NestedGraphNode from './node'
import NestedGraphLink from './link'

export default class NestedGraph extends NestedGraphConstants {
  constructor (graphData, layoutData, reverse) {
    super()
    this.setGrid(layoutData, reverse)
    this.setNodes(graphData, reverse)
    this.setLinks(graphData)
    this.setRootNodes()
    this.culcRootNodePosition()
  }

  setGrid (layoutData, reverse) {
    const selectedLayoutData = reverse ? layoutData.reverse : layoutData.standard
    this.grid = new GridOperator(selectedLayoutData)
  }

  setNodes (graphData, reverse) {
    this.nodes = []
    for (const layer of graphData) {
      for (const node of layer.nodes) {
        this.nodes.push(new NestedGraphNode(node, reverse))
      }
    }
  }

  setLinks (graphData) {
    this.links = []
    for (const layer of graphData) {
      this.links = this.links.concat(
        layer.links.map(d => new NestedGraphLink(d))
      )
    }
  }

  setRootNodes () {
    this.rootNodes = this.nodes.filter(d => d.isRootNode())
  }

  findNodeByPath (path) {
    return this.nodes.find(d => d.path === path)
  }

  culcRootNodePosition () {
    for (const rootNode of this.rootNodes) {
      const ordinalPosition = this.grid.ordinalPositionByNodePath(rootNode.path)
      rootNode.setGridPosition(ordinalPosition)
      this.culcNodePosition(rootNode, this.grid.positionByOrdinal(ordinalPosition))
    }
  }

  singleParentChildNodePaths (node) {
    return node.childNodePaths().filter(path => {
      const childNode = this.findNodeByPath(path)
      return childNode.numberOfParentNodes() === 1
    })
  }

  culcNodePosition (node, basePosition) {
    // console.log(`path: ${node.path}`)
    this.culcTpPosition(node, basePosition)

    // if the node is leaf:
    // only counted as child node when it has single parent.
    // if it has multiple parents, it breaks tree structure.
    if (this.singleParentChildNodePaths(node).length < 1) {
      return this.culcLeafNodeWH(node, basePosition)
    }
    // recursive position calculation
    const childrenWHList = this.culcChildNodePosition(node, basePosition)
    return this.culcSubRootNodeWH(node, basePosition, childrenWHList)
  }

  culcChildNodePosition (node, basePosition) {
    const childrenWHList = [] // [{ width: w, height: h }]
    let nx11 = basePosition.x + this.nodeXPad
    const ny1x = basePosition.y + (this.nodeYPad + this.r) * 2

    for (const childNodePath of this.singleParentChildNodePaths(node)) {
      // console.log(`  childrenNodePath: ${childNodePath}`)
      const childNode = this.findNodeByPath(childNodePath)
      // recursive search
      const wh = this.culcNodePosition(childNode, { x: nx11, y: ny1x })
      childrenWHList.push(wh)
      nx11 += wh.width + this.nodeXPad
    }
    return childrenWHList
  }

  widthByTp (node) {
    const tpNum = node.numberOfTps()
    return this.nodeXPad * 2 + 2 * this.r * tpNum + this.tpInterval * (tpNum - 1)
  }

  heightByTp () {
    return (this.nodeYPad + this.r) * 2
  }

  widthByChildNodes (node, childrenWHList) {
    return this.nodeXPad * 2 +
      childrenWHList.reduce((sum, d) => { return sum + d.width }, 0) +
      this.nodeXPad * (this.singleParentChildNodePaths(node).length - 1)
  }

  heightByChildNodes (childrenWHList) {
    const maxChildHeight = Math.max(...childrenWHList.map(d => d.height))
    return this.heightByTp() + maxChildHeight + this.nodeYPad
  }

  culcSubRootNodeWH (node, basePosition, childrenWHList) {
    // width
    const widthByChildNodes = this.widthByChildNodes(node, childrenWHList)
    const widthByTp = this.widthByTp(node)
    const width = widthByChildNodes < widthByTp ? widthByTp : widthByChildNodes
    // height
    const height = this.heightByChildNodes(childrenWHList)

    node.setRect(basePosition.x, basePosition.y, width, height)
    return { width: width, height: height }
  }

  culcLeafNodeWH (node, basePosition) {
    // console.log(`  return: ${node.path} does not have child node`)
    const width = this.widthByTp(node)
    const height = this.heightByTp()

    node.setRect(basePosition.x, basePosition.y, width, height)
    return { width: width, height: height }
  }

  culcTpPosition (node, basePosition) {
    let cx11 = basePosition.x + this.nodeXPad + this.r
    const cy1x = basePosition.y + this.nodeYPad + this.r
    for (const tpPath of node.tpPathsInParents()) {
      const tp = this.findNodeByPath(tpPath)
      tp.setCircle(cx11, cy1x, this.r)
      cx11 += this.r * 2 + this.tpInterval
    }
  }

  operativeNodes () {
    return this.nodes.filter(node => node.operative)
  }

  operativeLinksIn (operativeNodes) {
    return this.links.filter(link => link.availableIn(operativeNodes))
  }

  makeSupportTpLinks (operativeNodes) {
    const supportTpLinks = []
    for (const tp of operativeNodes.filter(d => d.isTp())) {
      // check tp path is available in operativeNodes?
      for (const childTpPath of tp.childTpPaths()) {
        const childTp = operativeNodes.find(d => d.path === childTpPath)
        if (!childTp) {
          continue
        }
        const name = `${tp.linkPath()},${childTp.linkPath()}`
        supportTpLinks.push({
          name: name,
          path: `inter-layer/${name}`,
          type: 'support-tp',
          sourcePath: tp.path,
          targetPath: childTpPath,
          sourceId: tp.id,
          targetId: childTp.id
        })
      }
    }
    return supportTpLinks
  }

  toData () {
    const operativeNodes = this.operativeNodes()
    const supportTpLinks = this.makeSupportTpLinks(operativeNodes)
    return {
      nodes: operativeNodes,
      links: this.operativeLinksIn(operativeNodes).concat(supportTpLinks),
      grid: this.grid.toData()
    }
  }
}