import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ReactMapGL, { WebMercatorViewport } from 'react-map-gl';
import bbox from '@turf/bbox';
import { useDebounce } from 'use-debounce';

import { StoreContext } from '../store/StoreContext';
import CurrentTraceLayer from './layers/CurrentTraceLayer';
import ExploreAllLayer from './layers/ExploreAllLayer';
import SelectedPlaceLayer from './layers/SelectedPlaceLayer';
import HoverPopup from './HoverPopup';
import Selection from '../Selection';

import './Map.scss';

const Map = props => {

  const el = useRef();

  const { store } = useContext(StoreContext);

  const [ isInitialLoad, setIsInitialLoad ] = useState(true);

  const [ viewport, setViewport ] = useState({
    latitude: 46.2,
    longitude: 16.4,
    zoom: 4,
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [ hover, setHover ] = useState();

  const [ debouncedViewport ] = useDebounce(viewport, 500);

  const [ everything, setEverything ] = useState(null);

  const getEverything = useCallback(viewport => {
    const bounds = new WebMercatorViewport(viewport).getBounds();
    return store.getNodesInBBox(bounds);
  });

  useEffect(() => {
    if (isInitialLoad) {
      const [ minLon, minLat, maxLon, maxLat ] = bbox(props.currentTrace);
      const initialViewport =
        new WebMercatorViewport(viewport).fitBounds(
          [[minLon, minLat], [maxLon, maxLat]], 
          { padding: { top:0, right:600, bottom:0, left:0 }}
        );

      setViewport(initialViewport);
      setIsInitialLoad(false);
    }
  }, [ props.currentTrace ]);

  useEffect(() => {
    if (props.exploreArea) {
      setEverything(getEverything(debouncedViewport));
    } else {
      setEverything(null);
    }   
  }, [ props.exploreArea, debouncedViewport ]);

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

  const onMouseDown = () => hover ? 
    props.onSelect(new Selection(store, store.getNode(hover.feature.properties.id))) : 
    props.onSelect(null);

  const style = 'https://api.maptiler.com/maps/outdoor/style.json?key=KVZVsqgpG5DhG9pfsOIx'
  // const style = 'https://klokantech.github.io/roman-empire/style.json'

  return (  
    <div className="p6o-map-container">
      <ReactMapGL
        {...viewport}
        width="100vw"
        height="100vh"
        ref={el}
        mapStyle={style}
        getCursor={() => hover ? 'pointer' : 'auto'}
        onViewportChange={setViewport}
        onMouseDown={onMouseDown}
        onHover={onHover}>

        {everything && 
          <ExploreAllLayer features={everything} /> }

        {props.currentTrace && 
          <CurrentTraceLayer 
            shapesToCentroids
            features={props.currentTrace.features} /> }

        {props.selected && 
          <SelectedPlaceLayer
            selected={props.selected} /> }
      </ReactMapGL>

      { hover && <HoverPopup {...hover} /> }
    </div>
  )

}

export default Map;