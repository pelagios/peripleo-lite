import createGraph from 'ngraph.graph';
import RBush from 'rbush';
import { importLinkedPlaces } from './datasources/LinkedPlacesSource';
import { importLinkedTraces } from './datasources/LinkedTracesSource';

/**
 * The central hub of the system. The store combines:
 * 
 * 1) a network graph where nodes are places, annotations and 
 *    annotation targets, and edges are links created either through
 *    annotation bodies, or gazetteer links
 * 2) a spatial tree of the geometry footprints of the graph
 *    nodes
 * 3) a text search index, currently only for places and 
 *    annotations (not targets)
 * 
 * The store has importers for Linked Places and Linked Traces
 * data formats, and supports the following queries:
 * 
 * - get graph node (or nodes) by URI(s)
 * - get nodes connected to a specific node
 * - get graph nodes that match a text search (optionally filtered by dataset)
 * - get all graph nodes within given geo bounds (optionally filtered by dataset)
 * - get all nodes for a given dataset
 */
export default class Store {

  constructor() {
    // The network graph
    this.graph = createGraph();

    // The 2D spatial tree
    this.tree = new RBush();

    this.index = {};
  }

  loadSource(name, format, url) {
    const { LINKED_PLACES, LINKED_TRACES } = Format;

    let promise = null;

    if (format === LINKED_PLACES) {
      promise = importLinkedPlaces(url, this.graph, this.index, this.tree);
    } else if (format === LINKED_TRACES) {
      promise = importLinkedTraces(url, this.graph, this.index);
    }

    return promise.then(geojson => {
      // TODO hack
      // this.sources[name] = geojson;

      // this.rank = computePagerank(this.graph);
    });
  }

  getSource(name) {
    return this.sources[name];
  }

  resolve(uris) {
    return uris.map(uri => ({ uri, resolved: this.index[uri] }));
  }

  getConnected(uri) {
    const connected = [];

    this.graph.forEachLinkedNode(uri, (linkedNode, link) => {
      connected.push(linkedNode);
    });

    return connected;
  }

  getAll(bounds) {
    const [ [ minX, minY ], [ maxX, maxY ]] = bounds;
    const result = this.tree.search({ minX, minY, maxX, maxY });
    return result.map(r => r.feature);
  }
  
  topPlaces(n) {
    const topPlaces = [];

    let idx = 0;
    let node = null;

    while (idx < this.rank.length && topPlaces.length < n) {
      node = this.graph.getNode(this.rank[idx].nodeId);

      // Check if this node has geometry
      if (node.data?.geometry)
        topPlaces.push(node.data);

      idx++;
    }

    return topPlaces;
  }

}

export const Format = {
  LINKED_PLACES: 'LINKED_PLACES',
  LINKED_TRACES: 'LINKED_TRACES'
}