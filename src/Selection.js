export default class Selection {

  /**
   * A Selection is ALWAYS a { node, link } tuple returned from 
   * the store
   */
  constructor(n, store) {
    this.node = n.node;
    this.links = n.links;
    this.store = store;
  }

  get type() {
    return this.node.type;
  }

}