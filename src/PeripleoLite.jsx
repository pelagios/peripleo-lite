import React, { useEffect, useState } from 'react';
import GraphStore, { Format } from './store/GraphStore';
import Basemap from './map/Basemap';
import TEIView  from './text/TEIView';

import './PeripleoLite.css';

const PeripleoLite = () => {

  const [ topPlaces, setTopPlaces ] = useState([]);

  const [ store, setStore ] = useState(new GraphStore());

  useEffect(() => {
    Promise.all([
      store.load('ToposText', 'data/ToposTextGazetteer.json', Format.LINKED_PLACES),
      // store.load('data/pausanias-book1-pt1-gr.xml', Format.TEI)
    ]).then(() => {
      setTopPlaces(store.topPlaces(100));
    });  
  }, [ store ]);

  const onPlacesChanged = uris=> {
    console.log('in view', uris);
  }

  const onSelectPlace = uri => {
    console.log('selected', uri);
  }
  
  return (
    <div className="container">
      <div className="row">
        <TEIView
          tei="data/pausanias-book1-pt1-gr.xml" 
          onPlacesChanged={onPlacesChanged} 
          onSelectPlace={onSelectPlace} />

        <Basemap source={store.getSource('ToposText')} />
      </div>
    </div>
  )

}

export default PeripleoLite;