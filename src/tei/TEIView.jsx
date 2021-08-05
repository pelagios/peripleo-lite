import React, { useContext, useEffect, useRef, useState } from 'react';
import Switch from 'react-switch';
import { BiWorld, BiBookOpen } from 'react-icons/bi';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable'; 
import CETEIcean from 'CETEIcean';
import TEIHistogram from './TEIHistogram';
import { linkValues } from '../AnnotationUtils';
import { normalizeURL } from '../store/importers';
import { StoreContext } from '../store/StoreContext';
import TraceView from '../traces/TraceView';

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

  const [ mapAll, setMapAll ] = useState(true);

  const [ sections, setSections ] = useState();

  const elem = useRef();

  const getURI = tag =>
    props.data.prefix + tag.id.substring(1);

  const uriToId = uri =>
    '_' + uri.substring(props.data.prefix.length);

  const onIntersect = entries => {
    // Split entries into entered vs. left 
    const entriesEntered = entries.filter(e => e.isIntersecting);
    const entriesLeft = entries.filter(e => !e.isIntersecting);

    // Keep track of current TEI sections
    const currentSections = new Set(entriesEntered.map(e => e.target.closest('tei-div')));

    if (currentSections.size > 0 && !eqSet(currentSections, sections))
      setSections(Array.from(currentSections));

    // Resolve entered/left annotations from store
    const resolveAnnotations = entries => entries
      .map(entry => store.getNode(getURI(entry.target)))
      .filter(e => e); // Remove unresolved;

    const annotationsEntered = resolveAnnotations(entriesEntered);
    const annotationsLeft = resolveAnnotations(entriesLeft);

    props.onAnnotationsChanged({
      enteredView: annotationsEntered,
      leftView: annotationsLeft
    });
  }

  const getAllAnnotations = () =>
    Array.from(document.querySelectorAll('tei-placename'))
      .map(placename => store.getNode(getURI(placename)))
      .filter(e => e); // Remove unresolved;
  
  useEffect(() => {
    const tei = new CETEIcean();

    tei.getHTML5(props.data.tei, data => {
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

      props.onAnnotationsLoaded(getAllAnnotations());
    });
  }, []);

  useEffect(() => {
    // Deselect first
    elem.current.querySelectorAll('.selected').forEach(elem => {
      elem.classList.remove('selected');
    });

    if (props.selected?.type === 'Annotation') {
      const linkedPlaces = Array.from(new Set(linkValues(props.selected).map(normalizeURL)));
      console.log('TEI: selecting', linkedPlaces);

      const toSelect = linkedPlaces.reduce((annotations, place) => {
        // For each linked place, get all annotations 
        return [ 
          ...annotations, 
          ...store.getLinkedNodes(place, 'Annotation').map(n => n.node.data) 
        ]
      }, []).map(annotation => uriToId(annotation.id));

      console.log(toSelect.length + ' annotations');

      toSelect.forEach(id =>
        document.getElementById(id)?.classList.add('selected'));
    } else if (props.selected?.type === 'Feature') {
      console.log('TEI: selecting', props.selected.id);

      const toSelect =
        store.getLinkedNodes(props.selected.id, 'Annotation')
          .map(n => uriToId(n.node.data.id));

      console.log(toSelect.length + ' annotations');

      toSelect.forEach(id =>
        document.getElementById(id)?.classList.add('selected'));
    }
  }, [ props.selected ]);

  const onClick = evt => {
    const annotation = store.getNode(getURI(evt.target));
    // TODO
    // props.onSelectAnnotation(annotation);
  }

  return (
    <Draggable 
      handle="header"
      cancel=".react-resizable-handle, .map-all-toggle">

      <ResizableBox 
        className="p6o-tei-wrapper"
        width={540}
        height={600}>
        <div className="p6o-tei">
          <header>
            <h1>{props.data.name}</h1>
            <label className="map-all-toggle">
              <span>Map all places</span>
              <Switch 
                className="toggle"
                height={22}
                width={52}
                onColor="#939798"
                offColor="#939798"
                checkedIcon={ <BiBookOpen /> }
                uncheckedIcon={ <BiWorld /> }
                checked={!props.showAll}
                onChange={checked => props.onShowAll(!checked)} />
              <span>places in view</span>
            </label>
          </header>
          
          <div 
            ref={elem}
            className="p6o-tei-text" 
            onClick={onClick} />

          {<TEIHistogram
            tei={tei} 
            prefix={props.data.prefix}
            sections={sections} />}
        </div>
      </ResizableBox>
    </Draggable>
  )

}

/**
 * Wraps the TEIView into a TraceView that adds some generic state 
 * management boilerplate.
 */
const TEITraceView = props => {

  return (
    <TraceView 
      filter={props.filter}
      defaultShowAll={true}
      onAnnotationsChanged={props.onAnnotationsChanged}>

      <TEIView 
        data={props.data}
        selected={props.selected}
        onSelect={props.onSelect} />
    </TraceView>
  )

}

export default TEITraceView;