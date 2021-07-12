import React, { useState } from 'react';
import ReactMapGL, { Layer, Marker, Source } from 'react-map-gl';
import centroid from '@turf/centroid';

const Basemap = props => {

  const [ viewport, setViewport ] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 46.2,
    longitude: 16.4,
    zoom: 4
  });

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
      'circle-radius': 4,
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

  return (
    <ReactMapGL
      {...viewport}
      mapStyle={style}
      onViewportChange={setViewport}
      onClick={onClick}>

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

    </ReactMapGL>
  )

}

export default Basemap;