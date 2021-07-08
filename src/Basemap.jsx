import React, { useState } from 'react';
import ReactMapGL from 'react-map-gl';

const Basemap = props => {

  const [ viewport, setViewport ] = useState({
    width: 400,
    height: 400,
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  });

  return (
    <ReactMapGL
      {...viewport}
      onViewportChange={nextViewport => setViewport(nextViewport)}
    />
  )

}

export default Basemap;