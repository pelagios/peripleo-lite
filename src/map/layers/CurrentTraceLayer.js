import React from 'react';
import MixedLayer from './MixedLayer';
import { colorFill, scaledCircle } from '../Styles';

const CurrentTraceLayer = props => {

  return (
    <MixedLayer
      {...props}
      centroidLayerId="p6o-current-trace-centroids" 
      pointLayerId="p6o-current-trace-points" 
      shapeLayerId="p6o-current-trace-shapes" 
      pointStyle={scaledCircle({ property: 'occurrences' })}
      shapeStyle={colorFill()} />
  )

}

export default CurrentTraceLayer;