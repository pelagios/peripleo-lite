import React, { useCallback, useEffect, useState } from 'react';
import ReactMapGL, { Layer, Source } from 'react-map-gl';

const Basemap = props => {

  const [ viewport, setViewport ] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 46.2,
    longitude: 16.4,
    zoom: 4
  });

  const [ selected, setSelected ] = useState();

  const onHover = useCallback(evt => {
    const peripleoFeatures = evt.features.filter(f => f.source.startsWith('peripleo'));
    if (peripleoFeatures.length > 0)
      props.onHover(peripleoFeatures[0]);
    else 
      props.onHover(null);
  }, []);

  useEffect(() => {
    if (props.selected) {
      const { resolved } = props.store.resolve([ props.selected ])[0];
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
    features: props.source?.features.filter(f => f.geometry?.type === 'Point') || []
  }

  const shapes = {
    type: 'FeatureCollection',
    features: props.source?.features.filter(f => f.geometry?.type !== 'Point') || []
  }

  const onClick = evt => {
    const features = evt.features.filter(f => f.source.startsWith('peripleo'));
    if (features.length > 0)
      props.onSelectPlace(features[0].properties.uri);
  }

  const style = 'https://api.maptiler.com/maps/outdoor/style.json?key=FZebSVZUiIemGD0m8ayh'
  // const style = 'https://klokantech.github.io/roman-empire/style.json'

  const pointLayerStyle = {
    'type': 'circle',
    'paint': {
      'circle-radius': [
        '*',
        4,
        [ 'number', ['get', 'occurrences' ], 1 ]
      ],
      'circle-stroke-width': 1,
      'circle-color': '#ff623b',
      'circle-stroke-color': '#8d260c'
    }
  };

  const polyLayerStyle = {
    'type': 'fill',
    'paint': {
      'fill-color': '#ff623b',
      'fill-opacity': 0.15
    }
  };

  const pointLayerStyleSelected = {
    'type': 'circle',
    'paint': {
      ...pointLayerStyle.paint,
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

      {props.source && 
        <>
          <Source id="peripleo-polygons" type="geojson" data={shapes}>
            <Layer {...polyLayerStyle} />
          </Source>
          <Source id="peripleo-points" type="geojson" data={points}>
           <Layer {...pointLayerStyle} />
          </Source>
        </>
      }

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