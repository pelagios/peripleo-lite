import React, { useContext, useEffect, useState } from 'react';
import Draggable from 'react-draggable'; 
import Switch from 'react-switch';
import { ResizableBox } from 'react-resizable';
import { BiSpreadsheet } from 'react-icons/bi';

import { StoreContext } from '../store/StoreContext';
import Selection from '../Selection';
import TraceView from '../traces/TraceView';
import TextView from './TextView';
import Histogram from './Histogram';

import './TEIPanel.scss';

// TODO these could be made configurable externally
const DEFAULT_WIDTH = 540;
const DEFAULT_HEIGHT = 660;

/**
 * TODO resizing has horrible performance with large TEIs, because
 * the browser constantly reflows the layout. If we invest a bit more 
 * time, we could apply the drag-resize operation to a (normally hidden)
 * co-aligned empty DIV -> smooth resizing! And when the user is done
 * resizing, we apply the size to the TEIPanel, causing only a single 
 * reflow.
 */
const TEIPanel = props => {

  const { store } = useContext(StoreContext);

  const [ loaded, setLoaded ] = useState(false);

  const [ allAnnotations, setAllAnnotations ] = useState();

  const [ visibleSections, setVisibleSections ] = useState([]);

  useEffect(() => {
    const onKeydown = evt => {
      if (props.selected) {
        if (evt.which === 39) {
          // If there's a next in sequence, select!
          const next = props.selected.nextInSequence();
          if (next)
            props.onSelect(next);
        } else if (evt.which === 37) {
          // Same for prev
          const prev = props.selected.previousInSequence();
          if (prev)
            props.onSelect(prev);
        }
      }
    };

    document.addEventListener('keydown', onKeydown);

    return () => document.removeEventListener('keydown', onKeydown);
  }, [ props.selected, props.onSelect ]);

  const getSection = () => {
    const lastElem = visibleSections[visibleSections.length - 1];

    const lastSection = lastElem.getAttribute('n');
    const lastChapter = lastElem.parentNode.getAttribute('n');

    return lastChapter + '.' + lastSection;
  }

  const onLoaded = annotations => {
    setAllAnnotations(annotations);
    setLoaded(true);
    
    props.onAnnotationsLoaded(annotations);
  }

  const onSelectAnnotation = annotation => {
    if (annotation) {
      const selection = new Selection(store, annotation, allAnnotations);
      props.onSelect(selection);
    } else {
      props.onSelect(null);
    }
  }

  return (
    <Draggable 
      handle="header"
      cancel=".react-resizable-handle, .p6o-map-mode-switch">

      <ResizableBox 
        className="p6o-tei-panel"
        width={DEFAULT_WIDTH}
        height={DEFAULT_HEIGHT}>

        <div className="p6o-tei-panel-inner">
          <header>
            <h1>{props.data.name}</h1>

            <label className="p6o-map-mode-switch">
              <span>Map all places</span>

              <Switch 
                className="toggle"
                height={22}
                width={52}
                onColor="#939798"
                offColor="#939798"
                checkedIcon={false}
                uncheckedIcon={false}
                checked={!props.showAll}
                onChange={checked => props.onShowAll(!checked)} />

              <span>places in view</span>
            </label>
          </header>

          <main>
            <TextView 
              data={props.data} 
              onLoaded={onLoaded} 
              selected={props.selected}
              onSelectAnnotation={onSelectAnnotation}
              onAnnotationsChanged={props.onAnnotationsChanged} 
              onSectionsChanged={sections => setVisibleSections(sections)} />
          </main>

          <footer>
            {loaded &&
              <Histogram
                prefix={props.data.prefix}
                filter={props.filter}
                selected={props.selected}
                visibleSections={visibleSections} />
            }

            <div className="p6o-tei-statusbar">
              {visibleSections.length > 0 &&
                <>
                  <div className="p6o-tei-section-picker">
                    <span className="p6o-tei-current-section">
                      Section {getSection()}
                      <BiSpreadsheet />
                    </span>
                  </div>

                  <div className="p6o-tei-totals">
                    {allAnnotations.length} Annotations
                  </div>
                </>
              }
            </div>
          </footer>
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

      <TEIPanel 
        data={props.data}
        filter={props.filter}
        selected={props.selected}
        onSelect={props.onSelect} />
    </TraceView>
  )

}

export default TEITraceView;