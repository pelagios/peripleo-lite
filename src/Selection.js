import { linkValues, normalizeURI } from './AnnotationUtils';

export default class Selection {

  /**
   * A Selection is ALWAYS a { node, link } tuple returned from 
   * the store
   */
  constructor(node, store) {
    this.node = node;
    this.store = store;
  }

  get id() {
    return this.node.id;
  }

  get type() {
    return this.node.type;
  }

  get linkedIDs() {
    return Array.from(new Set(linkValues(this.node).map(normalizeURI)));
  }

  /** 
   * Convenience function that returns the 'nearest' Feature node.
   * If the selection is a Feature, it returns itself. If it is 
   * an annotation, it returns the first linked place it can find
   * in the graph.
   */
  asFeature = () => {
    if (this.node.type === 'Feature')
      return this.node;

    const places = this.store.getLinkedNodes(this.node.id, 'Feature').map(n => n.node.data);

    if (places.length > 0)
      return places[0];
  }

}