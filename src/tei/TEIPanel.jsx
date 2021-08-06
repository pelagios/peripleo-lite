import React, { useState } from 'react';
import Draggable from 'react-draggable'; 
import Switch from 'react-switch';
import { ResizableBox } from 'react-resizable';
import { BiSpreadsheet } from 'react-icons/bi';

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

  const [ loaded, setLoaded ] = useState(false);

  const [ totalAnnotations, setTotalAnnotations ] = useState();

  const [ visibleSections, setVisibleSections ] = useState([]);

  const getSection = () => {
    const lastElem = visibleSections[visibleSections.length - 1];

    const lastSection = lastElem.getAttribute('n');
    const lastChapter = lastElem.parentNode.getAttribute('n');

    return lastChapter + '.' + lastSection;
  }

  const onJumpToSection = () => {
    const str = window.prompt('Jump to section', 'E.g. 4.3');

    const isValid = /^\d+\.\d+$/.test(str);
    if (isValid) {
      const [ chapter, section ] = str.split('.');

      const chapterElem = document.querySelector(`tei-div[subtype="chapter"][n="${chapter}"]`);
      if (chapterElem) {
        const sectionElem = chapterElem.querySelector(`tei-div[subtype="section"][n="${section}"]`);
        if (sectionElem)
          sectionElem.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      alert('Invalid section');
    }
  }

  const onLoaded = annotations => {
    setTotalAnnotations(annotations.length);
    setLoaded(true);
    
    props.onAnnotationsLoaded(annotations);
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
                height={18}
                width={40}
                onColor="#ced0d1"
                offColor="#ced0d1"
                checkedIcon={false}
                uncheckedIcon={false}
                checked={!props.showAll}
                onChange={checked => props.onShowAll(!checked)} />

              <span>Places in view</span>
            </label>
          </header>

          <main>
            <TextView 
              data={props.data} 
              onLoaded={onLoaded} 
              selected={props.selected}
              onSelectAnnotation={props.onSelectAnnotation}
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
                    <span
                      className="p6o-tei-current-section"
                      onClick={onJumpToSection}>
                      <label>Section {getSection()}</label>
                      <span className="icon"><BiSpreadsheet /></span>
                    </span>
                  </div>

                  <div className="p6o-tei-totals">
                    {totalAnnotations.toLocaleString('en')} Annotations
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
      selected={props.selected}
      onSelect={props.onSelect}
      onAnnotationsChanged={props.onAnnotationsChanged}>

      <TEIPanel 
        data={props.data}
        filter={props.filter} />
    </TraceView>
  )

}

export default TEITraceView;