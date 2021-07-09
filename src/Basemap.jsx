import React, { useState } from 'react';
import ReactMapGL from 'react-map-gl';

const Basemap = props => {

  const [ viewport, setViewport ] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 46.2,
    longitude: 16.4,
    zoom: 4
  });

  // const style = 'https://api.maptiler.com/maps/outdoor/style.json?key=FZebSVZUiIemGD0m8ayh'
  const style = 'https://klokantech.github.io/roman-empire/style.json'

  return (
    <ReactMapGL
      {...viewport}
      mapStyle={style}
      onViewportChange={setViewport}
    />
  )

}

export default Basemap;