import React from 'react';
import MixedLayer from './MixedLayer';
import { circle, colorFill } from '../Styles';

const ExploreAllLayer = props => {

  return (
    <MixedLayer 
      {...props}
      centroidLayerId="p6o-explore-all-centroids" 
      pointLayerId="p6o-explore-all-points" 
      shapeLayerId="p6o-explore-all-shapes" 
      pointStyle={circle()}
      shapeStyle={colorFill()} />
  )

}

export default ExploreAllLayer;