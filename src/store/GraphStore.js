import createGraph from 'ngraph.graph';
import pagerank from 'ngraph.pagerank';

import { importLinkedPlaces } from './datasources/LinkedPlacesSource';
import { importLinkedTraces } from './datasources/LinkedTracesSource';

const computePagerank = graph => {
  const rank = pagerank(graph);
  const sorted = [];

  for (let nodeId in rank) {
    sorted.push({ nodeId, rank: rank[nodeId ]});
  }

  sorted.sort((a, b) => a.rank < b.rank ? 1 : -1);
  return sorted;
}

export default class GraphStore {

  constructor() {
    this.graph = createGraph();

    this.rank = [];

    this.sources = {};

    this.index = {};
  }

  loadSource(name, format, url) {
    const { LINKED_PLACES, LINKED_TRACES } = Format;

    let promise = null;

    if (format === LINKED_PLACES) {
      promise = importLinkedPlaces(url, this.graph, this.index);
    } else if (format === LINKED_TRACES) {
      promise = importLinkedTraces(url, this.graph, this.index);
    }

    return promise.then(geojson => {
      // TODO hack
      this.sources[name] = geojson;

      this.rank = computePagerank(this.graph);
    });
  }

  getSource(name) {
    return this.sources[name];
  }

  resolve(uris) {
    return uris.map(uri => ({ uri, resolved: this.index[uri] }));
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