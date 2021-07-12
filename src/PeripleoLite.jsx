import React, { useEffect, useState } from 'react';
import GraphStore, { Format } from './store/GraphStore';
import Basemap from './map/Basemap';
import TEIView  from './text/TEIView';

import './PeripleoLite.css';
import AnimatedPlaceView from './AnimatedPlaceView';

const PeripleoLite = () => {

  const [ markers, setMarkers ] = useState([]);

  const [ store, setStore ] = useState(new GraphStore());

  useEffect(() => {
    Promise.all([
      store.load('ToposText', 'data/ToposTextGazetteer.json', Format.LINKED_PLACES),
      // store.load('data/pausanias-book1-pt1-gr.xml', Format.TEI)
    ]);  
  }, [ store ]);

  const onPlacesChanged = uris => {
    // TODO cache
    const resolved = 
      store
        .resolve(uris).filter(({ resolved }) => resolved)
        .map(({ resolved }) => resolved);

    setMarkers(resolved);
  }

  const onSelectPlace = uri => {
    console.log('selected', uri);
  }
  
  return (
    <div className="container">
      <div className="row">
        <AnimatedPlaceView onPlacesChanged={onPlacesChanged}>
          <TEIView
            tei="data/pausanias-book1-pt1-gr.xml" 
            onSelectPlace={onSelectPlace} />
        </AnimatedPlaceView>

        <Basemap 
          markers={markers}
          source={store.getSource('ToposText')} />
      </div>
    </div>
  )

}

export default PeripleoLite;