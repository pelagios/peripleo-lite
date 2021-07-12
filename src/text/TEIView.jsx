import React, { useEffect, useRef } from 'react';
import CETEIcean from 'CETEIcean';
import { normalizeURL } from '../store/datasources';

import './TEIView.css';

const TEIView = props => {
  const elem = useRef();

  const callback = entries => {

    const distinctURIs = entries => 
      Array.from(new Set(
        entries
          .map(e => e.target.getAttribute('ref'))
          .filter(attr => attr) // Remove nulls
          .map(normalizeURL)
      ))
      
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
  }

  useEffect(() => {
    const tei = new CETEIcean();
    tei.getHTML5(props.tei, data => {
      elem.current.appendChild(data);

      console.log('init observer');
  
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