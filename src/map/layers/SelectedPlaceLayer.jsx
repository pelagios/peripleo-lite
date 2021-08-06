import React from 'react';
import { Layer, Source } from 'react-map-gl';
import centroid from '@turf/centroid';

export const selectedCircle = () => ({
  'type': 'circle',
  'paint': {
    'circle-radius': 18,
    'circle-blur': 0.8,
    'circle-color': '#000000',
    'circle-stroke-color': '#000000'
  }
});

export const sequenceLine = () => ({
  'type': 'line',
  'paint': {
    'line-color': '#ff0000',
    'line-dasharray': [2, 1],
    'line-width': 3,
    'line-opacity': [
      'case',
      ['==', ['get', 'leg'], 'previous'], 0.3,
      1
    ]
  }
})

const SelectedPlaceLayer = props => {

  const feature = props.selected.asFeature();

  // Might be null, if selection   not part of a sequence!
  const previous = props.selected.previousInSequence(2);
  const nextTwo = props.selected.nextInSequence(3);

  const hasSequence = previous?.length > 0 || nextTwo?.length > 0;

  const selectedCentroid = feature?.geometry && {
    ...centroid(feature), 
    properties: { ...feature.properties }
  };

  const getSequenceLine = () => {    

    const prevFeature = {
      type: 'Feature',
      properties: { leg: 'previous' },
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    };

    const nextFeature = {
      type: 'Feature',
      properties: { leg: 'next' },
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    };

    // If there is a previous in sequence with a geom, add it
    if (previous?.length > 0) {
      for (let selection of previous) {
        const f = selection.asFeature();
        if (f?.geometry)
          prevFeature.geometry.coordinates.push(centroid(f).geometry.coordinates);
      }
    }

    prevFeature.geometry.coordinates.push(selectedCentroid.geometry.coordinates);
    nextFeature.geometry.coordinates.push(selectedCentroid.geometry.coordinates);

    // If there are next in sequence with geom, add them
    if (nextTwo?.length > 0) {
      for (let selection of nextTwo) {
        const f = selection.asFeature();
        if (f?.geometry)
          nextFeature.geometry.coordinates.push(centroid(f).geometry.coordinates);
      }
    }

    return { 
      type: 'FeatureCollection', 
      features: [
        prevFeature, nextFeature
      ]
    };
  }

  return feature?.geometry ? (
    <>
      {hasSequence && 
        <Source
          type="geojson" 
          data={getSequenceLine()}>
          <Layer {...sequenceLine()} />
        </Source>
      }

      {/* <Source
        id="p6o-selected-centroid" 
        type="geojson" 
        data={selectedCentroid}>
        <Layer {...selectedCircle()} />
      </Source> */}
    </>
  ) : null;

}

export default SelectedPlaceLayer;