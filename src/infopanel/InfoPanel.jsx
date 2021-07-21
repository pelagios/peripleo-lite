import React from 'react';
import { tagValues } from '../AnnotationUtils';

const InfoPanel = props => {

  /*
  const place = props.store.getNode(props.place).node;

  const connected = props.store.getConnected(props.place).map(c => c.data);

  const linkedPlaces = connected.filter(c => c.type === 'Feature');
  const linkedTraces = connected.filter(c => c.type === 'Annotation');

  const tags = linkedTraces.reduce((tags, a) => [...tags, ...tagValues(a)], []);
  
  return place ? (
    <div className="p6o-infopanel">
      <header>
        <h1>{place.properties.title}</h1>
        <p>{place.properties.description}</p>
      </header>

      <footer>
        {Array.from(new Set(tags)).map(tag => 
          <span className="p6o-tag">{tag}</span>
        )}
      </footer>
    </div> 
  ) : null
  */

}

export default InfoPanel;