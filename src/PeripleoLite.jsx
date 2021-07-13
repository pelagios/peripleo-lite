import React, { useEffect, useState } from 'react';
import GraphStore, { Format } from './store/GraphStore';
import Basemap from './map/Basemap';
import TEIView  from './text/TEIView';

import './PeripleoLite.css';
import AnimatedPlaceView from './AnimatedPlaceView';

const PeripleoLite = () => {

  const [ markers, setMarkers ] = useState(null);

  const [ store, _ ] = useState(new GraphStore());

  const [ selected, setSelected ] = useState(null);

  useEffect(() => {
    Promise.all([
      store.load('ToposText', 'data/ToposTextGazetteer.json', Format.LINKED_PLACES),
      store.load('Pleiades', 'data/pleiades-places-latest.json', Format.LINKED_PLACES)
    ]);  
  }, [ store ]);

  const onPlacesChanged = uris => {
    // TODO cache
    const resolved = 
      store
        .resolve(uris).filter(({ resolved }) => resolved)
        .map(({ resolved }) => resolved);

    setMarkers({
      type: 'FeatureCollection',
      features: resolved
    });
  }

  const onSelectPlace = uri => {
    console.log(uri);
    setSelected(uri);
  }
  
  return (
    <div className="container">
      <div className="row">
        <Basemap 
          store={store}
          source={markers}
          selected={selected}
          onSelectPlace={onSelectPlace} />

        <AnimatedPlaceView onPlacesChanged={onPlacesChanged}>
          <TEIView
            tei="data/pausanias-book1-pt1-gr.xml" 
            selected={selected}
            onSelectPlace={onSelectPlace} />
        </AnimatedPlaceView>
      </div>
    </div>
  )

}

export default PeripleoLite;