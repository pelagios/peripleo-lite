import React, { useContext, useEffect, useRef, useState } from 'react';
import CETEIcean from 'CETEIcean';

import { StoreContext } from '../store/StoreContext';

/** Helper to compare sets by value **/
const equalLists = (al, bl) => {
  if (al.length !== bl.length) return false;
  
  for (let idx = 0; idx < al.length; i++) {
    if (al[idx] !== bl[idx])
      return false;
  }

  return true;
}

/**
 * A simple test to check if a DOM element is within the
 * vertical bounds of the container element.
 */
const isInViewRange = (elem, container) => {
  const containerBounds = container.getBoundingClientRect();
  const { top, bottom } = elem.getBoundingClientRect();
  return (top <= containerBounds.bottom && bottom >= containerBounds.top);
}

const TextView = props => {

  const elem = useRef();

  const { store } = useContext(StoreContext);

  const [ visibleSections, setVisibleSections ] = useState([]);

  // Shorthand to infer annotation URI for the elem
  const annotationURI = elem => elem.id ?
    props.data.prefix + elem.id.substring(1) : null;

  // Shorthand to infer the TEI element ID from the annotation
  const teiId = annotation =>
    '_' + annotation.id.substring(props.data.prefix.length);

  // Shorthand to add a CSS class to the element for the annotation
  const addClass = (annotation, cls) => {
    const elem = document.getElementById(teiId(annotation))
    if (elem) {
      elem.classList.add(cls);
      return elem;
    }
  }

  const onIntersect = entries => {
    // Split entries into entered vs. left 
    const entriesEntered = entries.filter(e => e.isIntersecting);
    const entriesLeft = entries.filter(e => !e.isIntersecting);

    // Keep track of current TEI sections intersecting the view
    const sections = entriesEntered.map(e => e.target.closest('tei-div'));

    if (!equalLists(sections, visibleSections))
      setVisibleSections(sections);

    // Resolve entered/left annotations from store
    const resolveAnnotations = entries => entries
      .map(entry => ({ entry, resolved: store.getNode(annotationURI(entry.target)) }))
      .filter(e => e.resolved); // Remove unresolved;

    const annotationsEntered = resolveAnnotations(entriesEntered);
    const annotationsLeft = resolveAnnotations(entriesLeft);

    // Poor-mans garbage collection
    window.setTimeout(() => {
      const garbage = annotationsEntered
        .filter(t => !isInViewRange(t.entry.target, elem.current.parentNode));

      if (garbage.length > 0 )
        props.onAnnotationsChanged({ 
          enteredView: [], 
          leftView: garbage.map(t => t.resolved) 
        });
    }, 1000);

    props.onAnnotationsChanged({
      enteredView: annotationsEntered.map(t => t.resolved),
      leftView: annotationsLeft.map(t => t.resolved)
    });
  }

  // Load TEI on mount and push TEI upward
  useEffect(() => {
    const tei = new CETEIcean();

    tei.getHTML5(props.data.tei, data => {
      // Append TEI document
      elem.current.appendChild(data);
  
      // Init intersection observer
      const observer = new IntersectionObserver(onIntersect, {
        root: elem.current.parentElement
      });
  
      document.querySelectorAll('tei-placename')
        .forEach(p => observer.observe(p));

      // Grab all placename tags from the TEI and resolve against the store
      const annotations = Array.from(document.querySelectorAll('tei-placename'))
        .map(placename => store.getNode(annotationURI(placename)))
        .filter(e => e); // Remove unresolved;

      // Notify parent component
      props.onLoaded(annotations);
    });
  }, []);

  // Helper: returns annotations connected to the same node(s) 
  // as the given selection ("sibling nodes") 
  const siblingsTo = selected =>
    selected.linkedIDs.reduce((annotations, id) => [
      ...annotations, 
      ...store.getLinkedNodes(id, 'Annotation').map(n => n.node.data) 
    ], []);

  // Helper: returns annotations linked to the given selection
  const linkedTo = selected =>
    store.getLinkedNodes(selected.id, 'Annotation').map(n => n.node.data);

  // Selection changed
  useEffect(() => {
    // Deselect first
    elem.current.querySelectorAll('.selected').forEach(elem => {
      elem.classList.remove('selected');
      elem.classList.remove('primary');
    });

    // Depending on selection, get linked or sibling annotations
    let toSelect = [];

    if (props.selected?.type === 'Annotation') {
      // If an annotation is selected, fetch all links in this annotation
      // and that get all other annotations linking to the same URI
      toSelect = siblingsTo(props.selected);

      // In addition, highlight *this* annotation extra and scroll into view 
      addClass(props.selected, 'primary')
        .scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } else if (props.selected?.type === 'Feature') {
      // If a place is selected, fetch all annotations linked to it
      toSelect = linkedTo(props.selected);
    }

    // Select
    toSelect.forEach(annotation => addClass(annotation, 'selected'));
  }, [ props.selected ]);

  useEffect(() => 
    props.onSectionsChanged(visibleSections), [ visibleSections ]);

  const onClick = evt =>
    props.onSelectAnnotation(store.getNode(annotationURI(evt.target)));

  return (
    <div 
      ref={elem}
      className="p6o-tei-text" 
      onClick={onClick} />
  )

}

export default TextView;