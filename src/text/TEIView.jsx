import React, { useEffect, useRef, useState } from 'react';
import CETEIcean from 'CETEIcean';
import TEIHistogram from './TEIHistogram';
import { normalizeURL } from '../store/importers';

import './TEIView.scss';

const TEIView = props => {
  
  const [ tei, setTei ] = useState();

  const elem = useRef();

  const onIntersect = entries => {
    // Split entries into entered vs. left 
    const entriesEntered = entries.filter(e => e.isIntersecting);
    const entriesLeft = entries.filter(e => !e.isIntersecting);

    // Resolve entered/left annotations from store
    const resolveAnnotations = entries => entries.map(entry => {
      const uri = props.base + entry.target.id.substring(1);
      return props.store.getNode(uri);
    }).filter(e => e); // Remove unresolved;

    const annotationsEntered = resolveAnnotations(entriesEntered);
    const annotationsLeft = resolveAnnotations(entriesLeft);

    props.onAnnotationsChanged({
      enteredView: annotationsEntered,
      leftView: annotationsLeft
    });
  }

  useEffect(() => {
    const tei = new CETEIcean();

    tei.getHTML5(props.tei, data => {
      elem.current.appendChild(data);
  
      const options = {
        root: elem.current.parentElement,
        rootMargin: '0px',
        threshold: 1.0
      }
      
      const observer = new IntersectionObserver(onIntersect, options);
  
      document.querySelectorAll('tei-placename').forEach(placename => {
        observer.observe(placename);
      });

      setTei(data);
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
    <div className="p6o-tei">
      <div 
        ref={elem}
        className="p6o-tei-text" 
        onClick={onClick}
      />

      <TEIHistogram tei={tei} />
    </div>
  )

}

export default TEIView;