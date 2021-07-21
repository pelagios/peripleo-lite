import createGraph from 'ngraph.graph';
import RBush from 'rbush';
import bbox from '@turf/bbox';
import * as JsSearch from 'js-search';
import Formats from './Formats';
import { importLinkedPlaces } from './importers/LinkedPlacesImporter';
import { importLinkedTraces } from './importers/LinkedTracesImporter';

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
 * - get all graph nodes within given geo bounds (optionally filtered by dataset)
 * - get all nodes for a given dataset
 * - list the names of all imported datasets
 * - get graph nodes that match a text search (optionally filtered by dataset)
 * 
 * The search index only indexes places and annotation targets, not annotations!
 * It does not hold copies of the nodes themselves, only descriptive index records.
 * Index records have the following schema:
 * 
 * {
 *   id: 'unique ID of the node (usually a URI)',
 *   title: 'a title (mandatory)',
 *   type: 'an item type (mandatory)',
 *   dataset: 'the dataset name to which the item belongs (mandatory)',
 *   description: 'a description (optional)',
 *   names: 'alternative names of the place or object (optional),
 * }
 * 
 */
export default class Store {

  constructor() {
    // The network graph
    this.graph = createGraph();

    // The 2D spatial tree
    this.tree = new RBush();

    // Text search index
    this.search = new JsSearch.Search('id');
    this.search.tokenizer = {
      tokenize(text) {
        return text
          .replace(/[.,'"#!$%^&*;:{}=\-_`~()]/g, '')
          .split(/[\s,-]+/)
      }
    };

    this.search.addIndex('title'); 
    this.search.addIndex('description');
    this.search.addIndex('names'); 

    // Dataset names
    this.datasets = [];
  }

  /**
   * Import a dataset into the store, from the given URL.
   * @param name the name of the dataset 
   * @param format the format (Formats.LINKED_PLACES or Format.LINKED_TRACES)
   * @param url URL
   */
  importDataset(name, format, url) {
    const { LINKED_PLACES, LINKED_TRACES } = Formats;

    let promise = null;

    if (format === LINKED_PLACES) {
      promise = importLinkedPlaces(name, url, this.graph, this.tree, this.search);
    } else if (format === LINKED_TRACES) {
      promise = importLinkedTraces(name, url, this.graph, this.tree, this.search);
    } else {
      throw 'Unsupported format: ' + format
    }

    return promise;
  }

  /**
   * A shorthand to import multiple datasets in one go.
   * @param list a list of objects { name, format, url }
   */
  importDatasets(list) {
    return Promise.all(list.map(({ name, format, url}) => 
      this.importDataset(name, format, url)))
  }

  /** Retrieve node by its ID **/
  getNode(id) {
    return this.graph.getNode(id)?.data;
  }

  /** Resolve a list of URIs in one go **/
  getNodes(ids) {
    return ids.map(id => (
      { id, node: this.graph.getNode(id)?.data }
    ))
  }

  /** Get all nodes linked to the given node **/
  getLinkedNodes(id) {
    const linkedNodes = [];

    this.graph.forEachLinkedNode(id, (node, link) => {
      linkedNodes.push({ node, link });
    });

    return linkedNodes;
  }

  /** 
   * List all nodes in the given geo bounds, optionally  
   * filtering by dataset
   */
  getNodesInBBox(bounds, optDataset) {
    const [ [ minX, minY ], [ maxX, maxY ]] = bounds;
    
    // Fetch result from spatial tree
    const result = this.tree.search({ minX, minY, maxX, maxY })
      .map(r => r.feature);

    const filtered = optDataset ? result.filter(r => r.dataset === optDataset) : result;

    // Hack: remove shapes larger than viewport
    const bboxInside = bbox => {
      const [ bminX, bminY, bmaxX, bmaxY ] = bbox;
      return bminX > minX && bmaxX < maxX && bminY > minY && bmaxY < maxY;
    }

    return filtered.filter(feature =>
      feature.geometry.type === 'Point' || bboxInside(bbox(feature)));
  }

  listAllNodes(dataset, type) {
    const nodes = [];

    if (dataset && type) {
      this.graph.forEachNode(node => {
        if (node.data?.dataset === dataset && node.data?.type === type)
          nodes.push(node);
      });
    } else if (dataset) {
      this.graph.forEachNode(node => {
        if (node.data?.dataset === dataset)
          nodes.push(node);
      });
    } else if (type) {
      this.graph.forEachNode(node => {
        if (node.data?.type === type)
          nodes.push(node);
      });
    } else {
      this.graph.forEachNode(node => {
          nodes.push(node);
      });
    };

    return nodes;
  }

  listDatasets() {
    return this.datasets.slice();
  }

  searchNodes(query) {
    // TODO
    return this.search.search(query);
  }

}
