import React, { useEffect, useRef, useState } from 'react';
import Store, { Format } from './store/Store';
import Basemap from './map/Basemap';
import TEIView  from './text/TEIView';
import AnimatedTraceView from './AnimatedTraceView';
import { getPlaces } from './store/Annotation';

import './PeripleoLite.css';
import InfoPanel from './infopanel/InfoPanel';

const PeripleoLite = () => {

  const [ markers, setMarkers ] = useState(null);

  const [ showEverything, setShowEveryThing ] = useState(false);

  const [ requiredTag, setRequiredTag ] = useState('');

  const [ loaded, setLoaded ] = useState(false);

  const [ store, _ ] = useState(new Store());

  const [ selected, setSelected ] = useState(null);

  const elem = useRef();

  useEffect(() => {
    Promise.all([
      // Gazetteers
      store.loadSource('ToposText', Format.LINKED_PLACES, 'data/ToposTextGazetteer.json'),
      store.loadSource('Pleiades',  Format.LINKED_PLACES, 'data/pleiades-places-latest.json'),
      store.loadSource('iDAI Gazetteer', Format.LINKED_PLACES, 'data/arachne-pausanias-places.lp.json'),

      // Traces
      store.loadSource('Arachne Monuments', Format.LINKED_TRACES, 'data/arachne-pausanias-traces.lt.json'),
      store.loadSource('Pausanias', Format.LINKED_TRACES, 'data/pausanias-book1-gr.jsonld')
    ]).then(() => setLoaded(true))
  }, [ store ]);

  const onAnnotationsChanged = annotations => {
    const placeCounts = getPlaces(annotations);

    const uris = Object.keys(placeCounts);

    const places = store.resolve(uris)
      .filter(p => p.resolved)
      .map(p => {
        const feature = { ...p.resolved };
        feature.properties.occurrences = placeCounts[p.uri];

        return feature;
      });

    setMarkers({
      type: 'FeatureCollection',
      features: places
    });
  }

  const onHover = place => {
    setSelected(place?.properties.uri);
  }

  const onSetFilter = () => {
    const f = elem.current.value;
    if (f) {
      setRequiredTag(f);
    } else {
      setRequiredTag(null);
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
          <AnimatedTraceView 
            filter={requiredTag}
            onAnnotationsChanged={onAnnotationsChanged}>
            <TEIView
              tei="data/pausanias-book1-pt1-gr.xml" 
              store={store}
              base="http://recogito.humlab.umu.se/annotation/"
              selected={selected}
              onSelectPlace={setSelected} />
          </AnimatedTraceView>
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