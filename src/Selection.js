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

  get type() {
    return this.node.type;
  }

  linkedNodes = () => {
    const linkedNodes = Array.from(new Set(linkValues(this.node).map(normalizeURI)));
    console.log('TEI: selecting', linkedPlaces);
  
  }

}