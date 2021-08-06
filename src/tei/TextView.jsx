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

const TextView = props => {

  const elem = useRef();

  const { store } = useContext(StoreContext);

  const [ visibleSections, setVisibleSections ] = useState([]);

  // Shorthand to infer annotation URI for the elem
  const annotationURI = elem => elem.id ?
    props.data.prefix + elem.id.substring(1) : null;

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
      .map(entry => store.getNode(annotationURI(entry.target)))
      .filter(e => e); // Remove unresolved;

    const annotationsEntered = resolveAnnotations(entriesEntered);
    const annotationsLeft = resolveAnnotations(entriesLeft);

    props.onAnnotationsChanged({
      enteredView: annotationsEntered,
      leftView: annotationsLeft
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
    elem.current.querySelectorAll('.selected').forEach(elem =>
      elem.classList.remove('selected'));

    // Depending on selection, get linked or sibling annotations
    let toSelect = [];

    if (props.selected?.type === 'Annotation') {
      // If an annotation is selected, fetch all links in this annotation
      // and that get all other annotations linking to the same URI
      toSelect = siblingsTo(props.selected)
    } else if (props.selected?.type === 'Feature') {
      // If a place is selected, fetch all annotations linked to it
      toSelect = linkedTo(props.selected);
    }

    // Select
    toSelect.forEach(annotation => {
      const teiId = '_' + annotation.id.substring(props.data.prefix.length);
      document.getElementById(teiId)?.classList.add('selected');
    })
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