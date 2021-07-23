import React, { useContext } from 'react';
import { StoreContext } from '../store/StoreContext';
import When from './when';
import { getDatasetColor } from '../Colors';

import './InfoPanel.scss';

// Shorthand
const distinct = arr => Array.from(new Set(arr));

const InfoPanel = props => {

  const { store } = useContext(StoreContext);

  const linkedPlaces = store
    .getLinkedNodes(props.id)
    .filter(t => t.node.data?.type === 'Feature')
    .map(t => t.node.data);

  // Shorthand - HACK!!
  const appendLinked = (optValues, prop) => {
    const values = (optValues || [])
      .map(objOrStr => objOrStr.url || objOrStr.toponym ?
          ({ ...obj, dataset: props.dataset }) :
          ({ url: objOrStr, dataset: props.dataset }));

    const linkedValues = linkedPlaces.reduce((props, feature) =>
      [
        ...props,
        ...(feature[prop] || []).map(obj => ({ ...obj, dataset: feature.properties.dataset }))
      ], []);

    return [ ...values, ...linkedValues ];
  }

  // Shorthand
  const first = (prop) => {
    if (props[prop]) {
      return props[prop];
    } else {
      const p = linkedPlaces.find(p => p[prop]);
      return p && p[prop];
    }
  }

  // TODO we'll assume type == 'Feature' for now - which means
  // it's a fully standards compliant LP record
  const uris = [
    { id: props.id, dataset: props.properties.dataset },
    ...linkedPlaces.map(p => ({ id: p.id, dataset: p.properties.dataset })) 
  ];

  const depictions = distinct(appendLinked(props.depictions, 'depictions')); 
  const hasDepictions = depictions.length > 0; // Shorthand

  const names = distinct(appendLinked(props.names, 'names'));
  const when = first('when') && new When(first('when'));

  return (
    <div className="p6o-infopanel">
      <header
        className={hasDepictions ? 'has-depictions' : null}
        style={hasDepictions ? {backgroundImage: `url(${depictions[0].url})`} : null}>

        <h3>{props.properties.title}</h3>
      </header>

      <main>
        {when && 
          <p className="when">
            {when.label}
          </p>
        }

        {names.length > 0 &&
          <ul className="names">
            {names.map(name => 
              <li key={name.toponym}>{name.toponym}</li>
            )}
          </ul>
        }

        <ul className="uris">
          {uris.map(u => 
            <li key={u.id} style={{ backgroundColor: getDatasetColor(u.dataset)}}>
              <a href={u.id}>{u.dataset}</a>
            </li>
          )}
        </ul>
      </main>

      <footer>

      </footer>
    </div> 
  )
 
}

export default InfoPanel;