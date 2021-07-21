import React, { useContext } from 'react';
import { StoreContext } from '../store/StoreContext';

import './InfoPanel.scss';

const InfoPanel = props => {

  const { store } = useContext(StoreContext);

  const linkedNodes = store.getLinkedNodes(props.id);

  // TODO we'll assume type == 'Feature' for now - which means
  // it's a fully standards compliant LP record

  console.log(props, linkedNodes);

  /*
  const place = props.store.getNode(props.place).node;

  const connected = props.store.getConnected(props.place).map(c => c.data);

  const linkedPlaces = connected.filter(c => c.type === 'Feature');
  const linkedTraces = connected.filter(c => c.type === 'Annotation');

  const tags = linkedTraces.reduce((tags, a) => [...tags, ...tagValues(a)], []);
        <header>
        <h1>{place.properties.title}</h1>
        <p>{place.properties.description}</p>
      </header>

      <footer>
        {Array.from(new Set(tags)).map(tag => 
          <span className="p6o-tag">{tag}</span>
        )}
      </footer>
  */

  return (
    <div className="p6o-infopanel">
      <header>
        <h3>{props.properties.title}</h3>

        {props.depictions?.map(url =>
          <img src={url} />
        )}
      </header>
    </div> 
  )
 
}

export default InfoPanel;