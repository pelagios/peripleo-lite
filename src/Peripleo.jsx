import React, { useContext, useEffect, useState } from 'react';

// Store
import { StoreContext } from './store/StoreContext';
import Formats from './store/Formats';

// Top-level UI
import HUD from './hud/HUD';
import Map from './map/Map';
import TEIPanel  from './tei/TEIPanel';
import InfoPanel from './infopanel/InfoPanel';

// Util
import { hasTagFilter } from './traces/Filters';
import { aggregateLinks } from './AnnotationUtils';

import './Peripleo.scss';

const initStore = (config, store) =>
  Promise.all(
    config.data.map(d => { 
      if (d.format === Formats.LINKED_PLACES || d.format === Formats.LINKED_TRACES) {
        return store.importDataset(d.name, d.format, d.src);
      } else if (d.format === Formats.TEI_LT) {
        return store.importDataset(d.name, Formats.LINKED_TRACES, d.trace);
      } else {
        throw "Unsupported format: " + d.format;
      }
    })
  ).then(() => config)

const PeripleoLite = () => {

  const { store } = useContext(StoreContext);

  // Load status is for future use
  const [ _, setLoadStatus ] = useState('LOADING');

  const [ currentTEI, setCurrentTEI ] = useState();

  const [ currentTrace, setCurrentTrace ] = useState();

  const [ currentSelection, setCurrentSelection ] = useState();

  const [ tagFilter, setTagFilter ] = useState();

  const [ isExploreAreaEnabled, setExploreAreaEnabled ] = useState(false);
  
  // Load data
  useEffect(() => {
    fetch('peripleo.config.json')
      .then(response => response.json())
      .then(config => initStore(config, store))
      .then(config =>
        // Hack: we're assuming there are 0 or 1 TEI data sources (but not more)
        setCurrentTEI(config.data.find(d => d.format === Formats.TEI_LT)))
      .then(() => setLoadStatus('COMPLETE'))
      .catch(error => {
        setLoadStatus('ERROR');
        console.error('Error loading Peripleo config. Please add a valid `peripleo.config.json` to your application root.');
      });
  }, []);

  // The annotations in the trace view have 
  // changed - resolve map features linked to the 
  // annotations and update everything 
  const onAnnotationsChanged = annotations => {
    
    // All links referenced in annotation bodies, with 
    // occurrence counts
    const linkAggregation = aggregateLinks(annotations);

    // Resolved features
    const features = linkAggregation.map(bucket => {

      const resolved = store.getNode(bucket.id);    

      if (resolved && resolved.type === 'Feature') {
        return { 
          ...resolved,
          properties: { 
            ...resolved.properties,
            occurrences: bucket.count,
            tags: bucket.tags
          }
        };
      } 
    })
    .filter(f => f?.geometry); // Remove unresolved and unlocated

    setCurrentTrace({ type: 'FeatureCollection', features });
  }

  return (
    <div className="container">
      {currentTrace && 
        <Map 
          currentTrace={currentTrace}
          exploreArea={isExploreAreaEnabled}
          selected={currentSelection}
          onSelect={setCurrentSelection} />
      }

      <HUD 
        onSetFilter={tag => setTagFilter(hasTagFilter(tag))} 
        onClearFilter={() => setTagFilter(null)}
        onExploreArea={() => setExploreAreaEnabled(!isExploreAreaEnabled)} />

      {currentTEI && 
        <TEIPanel
          data={currentTEI}
          filter={tagFilter}
          selected={currentSelection}
          onSelect={setCurrentSelection} 
          onAnnotationsChanged={onAnnotationsChanged} />
      }

      {currentSelection && 
        <InfoPanel selected={currentSelection} />
      }
    </div>
  )

}

export default PeripleoLite;