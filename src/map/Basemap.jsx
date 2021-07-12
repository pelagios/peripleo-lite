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

  const onClickMarker = f => () => { 
    console.log(f);
  }

  const layerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 3,
      'circle-color': 'rgba(255, 0, 0, 0.3)'
    }
  };

  const markers = props.markers.filter(f => f.geometry).map(f => {
    try {
      const coords = centroid(f.geometry).geometry.coordinates;
  
      return (
        <Marker
          key={f['@id']} 
          longitude={coords[0]}
          latitude={coords[1]} 
          offsetTop={-26}
          offsetLeft={-10}
          captureClick>

          <img onClick={onClickMarker(f)} src="mapbox-marker-icon-20px-red.png" />
        </Marker>
      )
    } catch (error) {
      console.log(f);
    }

  });

  const style = 'https://api.maptiler.com/maps/outdoor/style.json?key=FZebSVZUiIemGD0m8ayh'
  // const style = 'https://klokantech.github.io/roman-empire/style.json'



  const heatmapLayerStyle = {
    'id': 'earthquakes-heat',
    'type': 'heatmap',
    'source': 'point',
    'maxzoom': 9,
    'paint': {
      // Increase the heatmap weight based on frequency and property magnitude
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        0,
        0,
        6,
        1
      ],
      // Increase the heatmap color weight weight by zoom level
      // heatmap-intensity is a multiplier on top of heatmap-weight
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        1,
        9,
        3
      ],
      // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
      // Begin color ramp at 0-stop with a 0-transparancy color
      // to create a blur-like effect.
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(33,102,172,0)',
        0.2,
        'rgb(103,169,207)',
        0.4,
        'rgb(209,229,240)',
        0.6,
        'rgb(253,219,199)',
        0.8,
        'rgb(239,138,98)',
        1,
        'rgb(178,24,43)'
      ],
      // Adjust the heatmap radius by zoom level
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        2,
        9,
        20
      ],
      // Transition from heatmap to circle layer by zoom level
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7,
        1,
        9,
        0
      ]
    }
  };

  const pointLayerStyle = {
    'id': 'earthquakes-point',
    'type': 'circle',
    'source': 'point',
    'minzoom': 7,
    'paint': {
      // Size circle radius by earthquake magnitude and zoom level
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7,
        ['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
        16,
        ['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50]
      ],
      // Color circle by earthquake magnitude
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        1,
        'rgba(33,102,172,0)',
        2,
        'rgb(103,169,207)',
        3,
        'rgb(209,229,240)',
        4,
        'rgb(253,219,199)',
        5,
        'rgb(239,138,98)',
        6,
        'rgb(178,24,43)'
      ],
      'circle-stroke-color': 'white',
      'circle-stroke-width': 1,
      // Transition from heatmap to circle layer by zoom level
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7,
        0,
        8,
        1
      ]
    }
  };

  return (
    <ReactMapGL
      {...viewport}
      mapStyle={style}
      onViewportChange={setViewport}>

      {markers}

      {props.source && 
        <Source id="ToposText" type="geojson" data={props.source}>
          {/* <Layer {...heatmapLayerStyle} />
          <Layer {...pointLayerStyle} /> */}
        </Source>
      }

    </ReactMapGL>
  )

}

export default Basemap;