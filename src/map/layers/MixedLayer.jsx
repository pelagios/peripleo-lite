import React from 'react';
import { Layer, Source } from 'react-map-gl';
import centroid from '@turf/centroid';

// Shorthand
const featureCollection = features => ({
  type: 'FeatureCollection', features
})

/**
 * A standard "layer" internally combining a circle layer
 * for point features and a fill layer for shapes. Also
 * includes logic to switch to a 'points-only' layer replacing
 * shapes by their centroids.
 */
const MixedLayer = props => {

  const { shapesToCentroids } = props;

  // Remove features without geometry
  const features = props.features.filter(f => f.geometry); 

  const points = shapesToCentroids ? 
    // Convert shapes to centroid if needed..
    features.map(f => { 

      if (f.geometry.type === 'Point') {
        return f;
      // Dealing with the peculiarities of the J. Binder gazetteer
      } else if (f.geometry.type === 'GeometryCollection' && f.geometry.geometries.length === 1 && f.geometry.geometries[0].type === 'Point') {
        return { ...f, ...{ geometry: {
          type: 'Point',
          coordinates: f.geometry.geometries[0].coordinates
        }}};
      } else {
        return {...f, ...{ geometry: centroid(f).geometry }}
      }
    }) :

    // ...or filter
    features.filter(f => f.geometry.type === 'Point');

  const shapes = shapesToCentroids ? null :
    features.filter(f => f.geometry.type !== 'Point');

  return shapesToCentroids ? 
    <Source
      id={props.centroidLayerId} 
      type="geojson" 
      data={featureCollection(points)}>
        
      <Layer {...props.pointStyle} />
    </Source> : 

    <>
      <Source
        id={props.shapeLayerId}
        type="geojson" 
        data={featureCollection(shapes)}>

        <Layer {...props.shapeStyle} />

      </Source>

      <Source
        id={props.pointLayerId} 
        type="geojson" 
        data={featureCollection(points)}>
        
        <Layer {...props.pointStyle} />

      </Source>
    </>

} 

export default MixedLayer;