import React from 'react';
import { Layer, Source } from 'react-map-gl';
import centroid from '@turf/centroid';
import { colorFill, scaledCircle } from '../Styles';

// Shorthand
const featureCollection = features => ({
  type: 'FeatureCollection', features
})

const CurrentTraceLayer = props => {

  const { shapesToCentroids } = props;

  // Remove features without geometry
  const features = props.features.filter(f => f.geometry); 

  const points = shapesToCentroids ? 
    // Convert shapes to centroid if needed..
    features.map(f => f.geometry.type === 'Point' ? 
      f : {...f, ...{ geometry: centroid(f).geometry }}) :

    // ...or filter
    features.filter(f => f.geometry.type === 'Point');

  const shapes = shapesToCentroids ? null :
    features.filter(f => f.geometry.type !== 'Point');

  return shapesToCentroids ? 
    <Source
      id="p6o-current-trace-centroids" 
      type="geojson" 
      data={featureCollection(points)}>
        
      <Layer {...scaledCircle({ property: 'occurrences' })} />
    </Source> : 

    <>
      <Source
        id="p6o-current-trace-points" 
        type="geojson" 
        data={featureCollection(points)}>
        
        <Layer {...scaledCircle({ property: 'occurrences' })} />

      </Source>
      
      <Source
        id="p6o-current-trace-shapes" 
        type="geojson" 
        data={featureCollection(shapes)}>

        <Layer {...colorFill()} />

      </Source>
    </>

}

export default CurrentTraceLayer;