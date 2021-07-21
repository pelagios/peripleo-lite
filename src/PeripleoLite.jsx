import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from './store/StoreContext';
import Formats from './store/Formats';
import Map from './map/Map';
import TEIView  from './tei/TEIView';
import TraceView from './traces/TraceView';
import { hasTagFilter } from './traces/Filters';
import { aggregateLinks } from './AnnotationUtils';
import HUD from './hud/HUD';

import './PeripleoLite.scss';

const PeripleoLite = () => {

  const { store } = useContext(StoreContext);

  const [ loaded, setLoaded ] = useState(false);

  const [ currentTrace, setCurrentTrace ] = useState(null);

  const [ exploreArea, setExploreArea ] = useState(false);

  const [ tagFilter, setTagFilter ] = useState(null);

  const [ selected, setSelected ] = useState(null);

  // Load data on init
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
  }, []);

  // The trace view has changed - update everything
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

  const onClearFilter = () =>
    setTagFilter(null);

  const onSetFilter = tag =>
    setTagFilter(hasTagFilter(tag));

  const toggleExploreArea = () =>
    setExploreArea(!exploreArea);

  return (
    <div className="container">
      <div className="row">
        <Map 
          currentTrace={currentTrace}
          exploreArea={exploreArea}
          selected={selected}
          onSelectPlace={setSelected} />

        { loaded && 
          <TraceView 
            filter={tagFilter}
            onAnnotationsChanged={onAnnotationsChanged}>
            <TEIView
              tei="data/pausanias-book1.tei.xml" 
              filter={tagFilter}
              base="http://recogito.humlab.umu.se/annotation/"
              selected={selected}
              onSelectPlace={setSelected} />
          </TraceView>
        }
      </div>

      <HUD 
        onExploreArea={toggleExploreArea}
        onClearFilter={onClearFilter}
        onSetFilter={onSetFilter} />
    </div>
  )

}

export default PeripleoLite;