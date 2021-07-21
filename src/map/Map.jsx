import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactMapGL, { Layer, Source, WebMercatorViewport } from 'react-map-gl';
import { useDebounce } from 'use-debounce';
import CurrentTraceLayer from './layers/CurrentTraceLayer';
import ExploreAllLayer from './layers/ExploreAllLayer';
import HoverPopup from './HoverPopup';

import './Map.scss';

const Map = props => {

  const el = useRef();

  const [ viewport, setViewport ] = useState({
    latitude: 46.2,
    longitude: 16.4,
    zoom: 4
  });

  const [ hover, setHover ] = useState();

  const [ selected, setSelected ] = useState();

  const [ debouncedViewport ] = useDebounce(viewport, 500);

  const [ everything, setEverything ] = useState(null);

  const getEverything = useCallback(viewport => {
    const bounds = new WebMercatorViewport(viewport).getBounds();

    return props.store.getNodesInBBox(bounds);
  });

  useEffect(() => {
    if (props.showEverything) {
      setEverything(getEverything(debouncedViewport));
    } else {
      setEverything(null);
    }   
  }, [ props.showEverything, debouncedViewport ]);

  const onHover = useCallback(evt => {
    const { x, y } = evt.center;
    const peripleoFeatures = evt.features.filter(f => f.source.startsWith('p6o'));

    if (peripleoFeatures.length > 0) {
      const feature = peripleoFeatures[0];
      setHover({ feature, x, y });
    } else {
      setHover(null);      
    }
  }, []);

  useEffect(() => {
    if (props.selected) {
      const resolved = props.store.getNode(props.selected);
      setSelected(resolved);
    } else {
      setSelected(null);
    }
  }, [ props.selected ]);

  useEffect(() => {
    console.log('select feature: ', selected);
  }, [ selected ]);


  const onClick = evt => {
    const features = evt.features.filter(f => f.source.startsWith('peripleo'));
    if (features.length > 0)
      props.onSelectPlace(features[0].properties.uri);
  }

  const style = 'https://api.maptiler.com/maps/outdoor/style.json?key=FZebSVZUiIemGD0m8ayh'
  // const style = 'https://klokantech.github.io/roman-empire/style.json'

  const pointLayerStyleSelected = {
    'type': 'circle',
    'paint': {
      'circle-radius': 18,
      'circle-blur': 0.8,
      'circle-color': '#000000',
      'circle-stroke-color': '#000000'
    }
  }

  const polyLayerStyleSelected = {
    'type': 'fill',
    'paint': {
      'fill-color': '#000000',
      'fill-opacity': 0.4
    }
  }

  return (  
    <div className="p6o-map-container">
      <ReactMapGL
        {...viewport}
        width="100%"
        height="100%"
        ref={el}
        mapStyle={style}
        getCursor={() => hover ? 'pointer' : 'auto'}
        onViewportChange={setViewport}
        onClick={onClick}
        onHover={onHover}>

        {everything && 
          <ExploreAllLayer features={everything} /> }

        {props.currentTrace && 
          <CurrentTraceLayer 
            shapesToCentroids
            features={props.currentTrace.features} /> }

        { selected && 
          <Source type="geojson" data={selected?.geometry?.type === 'Point' ? selected : { type: 'FeatureCollection', features: [] }}>
            <Layer {...pointLayerStyleSelected} />
          </Source> }

        { selected && 
          <Source id="selected-pl" type="geojson" data={selected?.geometry?.type !== 'Point' ? selected : { type: 'FeatureCollection', features: [] }}>
            <Layer id="l-sel-pl" {...polyLayerStyleSelected} />
          </Source> }
      </ReactMapGL>

      { hover && <HoverPopup store={props.store} {...hover} /> }
    </div>
  )

}

export default Map;