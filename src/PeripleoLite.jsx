import React, { useEffect, useState } from 'react';
import Store from './store/Store';
import Formats from './store/Formats';
import Map from './map/Map';
import TEIView  from './text/TEIView';
import TraceView from './traces/TraceView';
import { hasTagFilter } from './traces/Filters';
import { aggregateLinks } from './AnnotationUtils';
import HUD from './hud/HUD';

import './PeripleoLite.scss';


const PeripleoLite = () => {

  const [ loaded, setLoaded ] = useState(false);

  const [ store, _ ] = useState(new Store());

  const [ currentTrace, setCurrentTrace ] = useState(null);




  const [ exploreArea, setExploreArea ] = useState(false);

  const [ tagFilter, setTagFilter ] = useState(null);



  const [ selected, setSelected ] = useState(null);


  useEffect(() => {
    Promise.all([
      // Gazetteers
      store.importDataset('ToposText', Formats.LINKED_PLACES, 'data/topostext-places.lp.json'),
      store.importDataset('Pleiades',  Formats.LINKED_PLACES, 'data/pleiades-places.lp.json'),
      store.importDataset('iDAI Gazetteer', Formats.LINKED_PLACES, 'data/arachne-pausanias-places.lp.json'),
      store.importDataset('ASCSA Agora', Formats.LINKED_PLACES, 'data/ascsa-monuments-places.lp.json'),

      // Traces
      store.importDataset('Arachne Monuments', Formats.LINKED_TRACES, 'data/arachne-pausanias-traces.lt.json'),
      store.importDataset('Pausanias', Formats.LINKED_TRACES, 'data/pausanias-book1.jsonld')
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

    setCurrentTrace({ type: 'FeatureCollection', features });
  }

  const onHover = place => {
    setSelected(place?.properties.uri);
  }

  const onClearFilter = () =>
    setTagFilter(null);

  const onSetFilter = tag =>
    setTagFilter(hasTagFilter(tag));

  const onExploreArea = () => {
    setExploreArea(!exploreArea);
  }

  
  return (
    <div className="container">
      <div className="row">
        <Map 
          store={store}
          currentTrace={currentTrace}
          selected={selected}
          showEverything={exploreArea}
          onHover={onHover}
          onSelectPlace={setSelected} />

        { loaded && 
          <TraceView 
            filter={tagFilter}
            onAnnotationsChanged={onAnnotationsChanged}>
            <TEIView
              tei="data/pausanias-book1.tei.xml" 
              filter={tagFilter}
              store={store}
              base="http://recogito.humlab.umu.se/annotation/"
              selected={selected}
              onSelectPlace={setSelected} />
          </TraceView>
        }
      </div>

      <HUD 
        store={store} 
        onExploreArea={onExploreArea}
        onClearFilter={onClearFilter}
        onSetFilter={onSetFilter} />
    </div>
  )

}

export default PeripleoLite;