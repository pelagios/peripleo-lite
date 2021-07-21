import React, { useCallback, useEffect, useState } from 'react';
import ReactMapGL, { Layer, Source, WebMercatorViewport } from 'react-map-gl';
import { useDebounce } from 'use-debounce';
import centroid from '@turf/centroid';
import CurrentTraceLayer from './layers/CurrentTraceLayer';

const Basemap = props => {

  const [ viewport, setViewport ] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 46.2,
    longitude: 16.4,
    zoom: 4
  });

  const [ selected, setSelected ] = useState();

  const [ debouncedViewport ] = useDebounce(viewport, 500);

  const [ everything, setEverything ] = useState(null);

  const getEverything = useCallback(viewport => {
    const bounds = new WebMercatorViewport(viewport).getBounds();

    return {
      'type': 'FeatureCollection',
      'features': props.store.getNodesInBBox(bounds)
    };
  });

  useEffect(() => {
    if (props.showEverything) {
      setEverything(getEverything(debouncedViewport));
    } else {
      setEverything(null);
    }   
  }, [ props.showEverything, debouncedViewport ]);

  const onHover = useCallback(evt => {
    const peripleoFeatures = evt.features.filter(f => f.source.startsWith('peripleo'));
    if (peripleoFeatures.length > 0)
      props.onHover(peripleoFeatures[0]);
    else 
      props.onHover(null);
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

  const points = {
    type: 'FeatureCollection',
    features: props.source?.features.map(f => {
      return f.geometry ?
        { ...f, ...{ geometry: centroid(f).geometry } } : f
      })
  }

  const shapes = {
    type: 'FeatureCollection',
    features: [] // props.source?.features.filter(f => f.geometry?.type !== 'Point') || []
  }

  const onClick = evt => {
    const features = evt.features.filter(f => f.source.startsWith('peripleo'));
    if (features.length > 0)
      props.onSelectPlace(features[0].properties.uri);
  }

  const style = 'https://api.maptiler.com/maps/outdoor/style.json?key=FZebSVZUiIemGD0m8ayh'
  // const style = 'https://klokantech.github.io/roman-empire/style.json'

  const everythingStyle = {
    'type': 'fill',
    'paint': {
      'fill-color': '#ff0000',
      'fill-opacity': 0.3,
      'fill-outline-color': '#000' 
    }
  };

  /*
  const everythingStyle = {
    'type': 'circle',
    'paint': {
      'circle-radius': [
        'interpolate',
        [ 'linear' ],
        [ 'zoom' ],
        3, 2,
        16, 8
      ],
      'circle-stroke-width': [
        'interpolate',
        [ 'linear' ],
        [ 'zoom' ],
        3, 0,
        16, 1
      ],
      'circle-stroke-color': '#880000',
      'circle-color': '#ff0000',
      'circle-opacity': [
        'interpolate',
        [ 'exponential', 0.5 ],
        [ 'zoom' ],
        10, 
        0.5,
        18,
        1
      ]
    }
  };
  */

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
    <ReactMapGL
      {...viewport}
      mapStyle={style}
      onViewportChange={setViewport}
      onClick={onClick}
      onHover={onHover}>

      {props.currentTrace && 
        <CurrentTraceLayer 
          shapesToCentroids
          features={props.currentTrace.features} />
      }

      { everything && 
        <Source type="geojson" data={everything}>
          <Layer {...everythingStyle} />
        </Source> }

      { selected && 
        <Source type="geojson" data={selected?.geometry?.type === 'Point' ? selected : { type: 'FeatureCollection', features: [] }}>
          <Layer {...pointLayerStyleSelected} />
        </Source> }

      { selected && 
        <Source id="selected-pl" type="geojson" data={selected?.geometry?.type !== 'Point' ? selected : { type: 'FeatureCollection', features: [] }}>
          <Layer id="l-sel-pl" {...polyLayerStyleSelected} />
        </Source> }

    </ReactMapGL>
  )

}

export default Basemap;