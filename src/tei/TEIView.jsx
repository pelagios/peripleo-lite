import React, { useContext, useEffect, useRef, useState } from 'react';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable'; 
import CETEIcean from 'CETEIcean';
import TEIHistogram from './TEIHistogram';
import { normalizeURL } from '../store/importers';
import { StoreContext } from '../store/StoreContext';

import './TEIView.scss';

function eqSet(as, bs) {
  if (!as || !bs) return false;
  if (as.size !== bs.size) return false;
  for (var a of as) if (!bs.has(a)) return false;
  return true;
}

const TEIView = props => {

  const { store } = useContext(StoreContext);
  
  const [ tei, setTei ] = useState();

  const [ sections, setSections ] = useState();

  const elem = useRef();

  const onIntersect = entries => {
    // Split entries into entered vs. left 
    const entriesEntered = entries.filter(e => e.isIntersecting);
    const entriesLeft = entries.filter(e => !e.isIntersecting);

    // Keep track of current TEI sections
    const currentSections = new Set(entriesEntered.map(e => e.target.closest('tei-div')));

    if (currentSections.size > 0 && !eqSet(currentSections, sections))
      setSections(Array.from(currentSections));

    // Resolve entered/left annotations from store
    const resolveAnnotations = entries => entries.map(entry => {
      const uri = props.base + entry.target.id.substring(1);
      return store.getNode(uri);
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
    <Draggable 
      handle="header"
      cancel=".react-resizable-handle">

      <ResizableBox 
        className="p6o-tei-wrapper"
        width={400}
        height={400}>
        <div className="p6o-tei">
          <header>
            <h1>Pausanias Book 1</h1>
          </header>
          
          <div 
            ref={elem}
            className="p6o-tei-text" 
            onClick={onClick} />

          {<TEIHistogram
            {...props}
            tei={tei} 
          sections={sections} />}
        </div>
      </ResizableBox>
    </Draggable>
  )

}

export default TEIView;