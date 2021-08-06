import { linkValues, normalizeURI } from './AnnotationUtils';

export default class Selection {

  /**
   * A Selection is ALWAYS a { node, link } tuple returned from 
   * the store
   */
  constructor(store, node, sequence) {
    this.store = store;
    this.node = node;
    this.sequence = sequence;
  }

  get id() {
    return this.node.id;
  }

  get type() {
    return this.node.type;
  }

  get hasSequence() {
    return this.sequence !== null && this.sequence !== undefined;
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

  /** 
   * In case the selection is part of an "ordered trace" (like a TEI document),
   * this method returns the next n selections in the trace sequence. If n is
   * omitted, only the next selection is returned.
   * 
   * The method returns null in case the selection is not part of an ordered trace;
   * and returns an empty array if the current selection is the end of the sequence.
   */
  nextInSequence = opt_n => {
    if (!this.sequence)
      return null;

    const n = opt_n || 1;

    const currentIdx = this.sequence.indexOf(this.node);
    const sliceTo = Math.min(currentIdx + n + 1, this.sequence.length);

    const nextNodes = this.sequence.slice(currentIdx + 1, sliceTo);
    const nextSelections = nextNodes.map(node => new Selection(this.store, node, this.sequence));

    return opt_n ? nextSelections : (
      nextSelections.length > 0 ? nextSelections[0] : null
    );
  }

  /** 
   * In case the selection is part of an "ordered trace" (like a TEI document),
   * this method returns the previous n selections in the trace sequence.
   * 
   * If n is omitted, just the previous selection is returned (or null).
   * 
   * The method returns null in case the selection is not part of an ordered trace;
   * and returns an empty array if the current selection is the start of the sequence.
   */
  previousInSequence = opt_n => {
    if (!this.sequence)
      return null;

    const n = opt_n || 1;

    const currentIdx = this.sequence.indexOf(this.node);
    const sliceFrom = Math.max(0, currentIdx - n);

    const prevNodes = this.sequence.slice(sliceFrom, currentIdx);
    const prevSelections = prevNodes.map(node => new Selection(this.store, node, this.sequence))
      .slice().reverse(); // Reverse order!

    return opt_n ? prevSelections : (
      prevSelections.length > 0 ? prevSelections[0] : null
    );
  }

}