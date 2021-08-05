import React, { useContext } from 'react';

import { StoreContext } from '../store/StoreContext';
import { colorForDataset } from '../Colors';
import When from './when';

import './InfoPanel.scss';

const distinct = arr => Array.from(new Set(arr));

const InfoPanel = props => {

  const { store } = useContext(StoreContext);

  // Selection is either a place or annotation
  const selectedPlaces = props.selected.type === 'Feature' ? 
    [ props.selected ] : store.getLinkedNodes(props.selected.id, 'Feature').map(n => n.node.data);

  if (selectedPlaces.length === 0)
    return null;

  // Limitation 1: current implementation shows first place only, and ignores the rest
  const place = selectedPlaces[0];

  // Limitation 2: no union records yet, only immediate linked neighbours
  const linkedPlaces = store.getLinkedNodes(place.id)
    .filter(t => t.node.data?.type === 'Feature')
    .map(t => t.node.data);

  // Helper: Shorthand that return the given property from the place or, if
  // the place doesn't have it, the first value found in linked places 
  const firstValue = key => {
    if (place[key]) {
      return place[key];
    } else {
      const p = linkedPlaces.find(p => p[key]);
      return p && p[key];
    }
  }

  // Helper: collects given properties from both the place and
  // all linked places, adding in source dataset info
  // HACK!!!
  const collectLinked = (optValues, prop) => {

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
  
  /*************************/
  /* Properties to display */
  /*************************/

  const gazetteerURIs = [
    { id: place.id, dataset: place.properties.dataset },
    ...linkedPlaces.map(p => ({ id: p.id, dataset: p.properties.dataset })) 
  ];
  
  const depictions = distinct(collectLinked(props.depictions, 'depictions')); 
  const hasDepictions = depictions.length > 0; // Shorthand

  const names = distinct(collectLinked(props.names, 'names'));
  const when = firstValue('when') && new When(firstValue('when'));

  return (
    <div className="p6o-infopanel">
      <header
        className={hasDepictions ? 'has-depictions' : null}
        style={hasDepictions ? { backgroundImage: `url(${depictions[0].url})` } : null}>

        <h3>{place.properties.title}</h3>
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
          {gazetteerURIs.map(u => 
            <li key={u.id} style={{ backgroundColor: colorForDataset(u.dataset) }}>
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