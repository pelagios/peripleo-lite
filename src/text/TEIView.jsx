import React, { useEffect, useRef } from 'react';
import CETEIcean from 'CETEIcean';
import { normalizeURL } from '../store/datasources';

import './TEIView.css';

const TEIView = props => {
  const elem = useRef();

  const callback = entries => {

    /*
    const distinctURIs = entries => 
      Array.from(new Set(
        entries
          .map(e => e.target.getAttribute('ref'))
          .filter(attr => attr) // Remove nulls
          .map(normalizeURL)
      ));
    */

    // Split entries into entered vs. left 
    const entriesEntered = entries.filter(e => e.isIntersecting);
    const entriesLeft = entries.filter(e => !e.isIntersecting);

    // Resolve entered/left annotations from store
    const resolveAnnotations = entries => entries.map(entry => {
      const uri = props.base + entry.target.id.substring(1);
      return props.store.resolve([ uri ])[0].resolved;
    }).filter(e => e); // Remove unresolved;

    const annotationsEntered = resolveAnnotations(entriesEntered);
    const annotationsLeft = resolveAnnotations(entriesLeft);

    props.onAnnotationsChanged({
      entered: annotationsEntered,
      left: annotationsLeft
    });

    /*
      
    const added = distinctURIs(entries.filter(e => e.isIntersecting));
    const removed = distinctURIs(entries.filter(e => !e.isIntersecting));

    if (added.length > 0 || removed.length > 0) {
      const diff = {};

      if (added.length > 0)
        diff.added = added;

      if (removed.length > 0)
        diff.removed = removed;

      props.onPlacesChanged(diff);
    }
    */
  }

  useEffect(() => {
    const tei = new CETEIcean();
    tei.getHTML5(props.tei, data => {
      elem.current.appendChild(data);
  
      const options = {
        root: elem.current,
        rootMargin: '0px',
        threshold: 1.0
      }
      
      const observer = new IntersectionObserver(callback, options);
  
      document.querySelectorAll('tei-placename').forEach(placename => {
        observer.observe(placename);
      });
    });
  }, []);

  useEffect(() => {
    // Deselect first
    elem.current.querySelectorAll('.selected').forEach(elem => {
      elem.classList.remove('selected');
    });

    // Select
    elem.current.querySelectorAll(`tei-placename[ref="${props.selected}"]`).forEach(elem => {
      elem.classList.add('selected');
    });
  }, [ props.selected ]);

  const onClick = evt => {
    const uri = evt.target.getAttribute('ref');

    if (uri)
      props.onSelectPlace(normalizeURL(uri));
  }

  return (
    <div 
      ref={elem}
      className="p6o-teiview" 
      onClick={onClick}
    />
  )

}

export default TEIView;