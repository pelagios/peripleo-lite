import React, { useEffect, useState } from 'react';
import { getDatasetColor } from '../Colors';

const HoverPopup = props => {

  const [ datasets, setDatasets ] = useState([ props.feature.properties.dataset ]);

  useEffect(() => {
    const { id } = props.feature.properties;

    const linkedGazetteers = props.store
      .getLinkedNodes(id)
      .filter(t => t.node.data?.type === 'Feature')
      .map(t => t.node.data?.properties.dataset);

    setDatasets(Array.from(
      new Set([ ...datasets, ...linkedGazetteers ])
    ));
  }, [ props.feature.properties.id ]);

  const style = {
    top: `${props.y}px`,
    left: `${props.x}px`
  }

  return (
    <div className="p6o-map-hover" style={style}>
      <label>{props.feature.properties.title}</label>
      <span className="gazetteers">
        {datasets.map(g => 
          <span
            key={g} 
            className={`gazetteer ${g}`}
            style={{ backgroundColor: getDatasetColor(g) }}>{g.substring(0, 1).toUpperCase()}</span>
        )}
      </span>
    </div>
  )

}

export default HoverPopup;