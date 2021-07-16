import React, { useEffect, useRef, useState } from 'react';
import Store from './store/Store';
import Formats from './store/Formats';
import Basemap from './map/Basemap';
import TEIView  from './text/TEIView';
import TraceView from './traces/TraceView';
import { hasTagFilter } from './traces/Filters';
import { aggregateLinks } from './AnnotationUtils';

import './PeripleoLite.css';
import InfoPanel from './infopanel/InfoPanel';

const PeripleoLite = () => {

  const [ markers, setMarkers ] = useState(null);

  const [ showEverything, setShowEveryThing ] = useState(false);

  const [ tagFilter, setTagFilter ] = useState(null);

  const [ loaded, setLoaded ] = useState(false);

  const [ store, _ ] = useState(new Store());

  const [ selected, setSelected ] = useState(null);

  const elem = useRef();

  useEffect(() => {
    Promise.all([
      // Gazetteers
      store.importDataset('ToposText', Formats.LINKED_PLACES, 'data/ToposTextGazetteer.json'),
      store.importDataset('Pleiades',  Formats.LINKED_PLACES, 'data/pleiades-places-latest.json'),
      store.importDataset('iDAI Gazetteer', Formats.LINKED_PLACES, 'data/arachne-pausanias-places.lp.json'),

      // Traces
      store.importDataset('Arachne Monuments', Formats.LINKED_TRACES, 'data/arachne-pausanias-traces.lt.json'),
      store.importDataset('Pausanias', Formats.LINKED_TRACES, 'data/pausanias-book1-gr.jsonld')
    ]).then(() => setLoaded(true))
  }, [ store ]);

  const onAnnotationsChanged = annotations => {
    const linkAggregation = aggregateLinks(annotations);

    const features = linkAggregation.map(bucket => {
      const feature = store.getNode(bucket.id);    

      if (feature && feature.type === 'Feature') {
        const f = { ...feature }; // Clone
        f.properties.occurrences = bucket.count;
        f.properties.tags = bucket.tags;
        return f;
      } 
    }).filter(f => f); // Remove unresolved

    setMarkers({ type: 'FeatureCollection', features });
  }

  const onHover = place => {
    setSelected(place?.properties.uri);
  }

  const onSetFilter = () => {
    const f = elem.current.value;
    if (f) {
      setTagFilter(hasTagFilter(f));
    } else {
      setTagFilter(null);
    }
  }

  const onShowEverything = () => {
    setShowEveryThing(!showEverything);
  }
  
  return (
    <div className="container">
      <div className="row">
        <Basemap 
          store={store}
          source={markers}
          selected={selected}
          showEverything={showEverything}
          onHover={onHover}
          onSelectPlace={setSelected} />

        { loaded && 
          <TraceView 
            filter={tagFilter}
            onAnnotationsChanged={onAnnotationsChanged}>
            <TEIView
              tei="data/pausanias-book1-pt1-gr.xml" 
              store={store}
              base="http://recogito.humlab.umu.se/annotation/"
              selected={selected}
              onSelectPlace={setSelected} />
          </TraceView>
        }
      </div>

      { selected && 
        <InfoPanel place={selected} store={store} />
      }

      <div className="show-everything">
        <button onClick={onShowEverything}>Show Everything</button>
      </div>

      <div className="filter">
        <input ref={elem} /><button onClick={onSetFilter}>Filter</button>
      </div>
    </div>
  )

}

export default PeripleoLite;