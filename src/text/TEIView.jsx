import React, { useState, useEffect, useRef } from 'react';
import CETEIcean from 'CETEIcean';
import { normalizeURL } from '../store/datasources';

import './TEIView.css';

const TEIView = props => {

  const [ placesInViewport, setPlacesInViewPort ] = useState([]);

  const elem = useRef();

  useEffect(() => {
    const tei = new CETEIcean();
    tei.getHTML5(props.tei, data => {
      elem.current.appendChild(data);

      const callback = entries => {
        const entered = entries.filter(e => e.isIntersecting).map(e => e.target);
        const exited = entries.filter(e => !e.isIntersecting).map(e => e.target);

        const updated = [
          ...placesInViewport.filter(elem => !exited.includes(elem)),
          ...entered 
        ];

        setPlacesInViewPort(updated);
      }
  
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
    const uris = placesInViewport
      .map(elem => elem.getAttribute('ref'))
      .filter(str => str) // Remove null
      .map(normalizeURL);

    const distinct = Array.from(new Set(uris));
    props.onPlacesChanged(distinct);
  }, [ placesInViewport ]);

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