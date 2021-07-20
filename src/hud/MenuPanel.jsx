import React from 'react';
import { motion } from 'framer-motion';
import FilterPanel from './filters/FilterPanel';

import './MenuPanel.scss';

const MenuPanel = props => {

  const onAddFilterPanel = () =>
    props.onAddPanel(
      <FilterPanel
        onClearFilter={props.onClearFilter}
        onSetFilter={props.onSetFilter} />
    )

  const onExploreArea = () =>
    props.onExploreArea();

  return (
    <>
      <motion.div
        className="p6o-hud-menupanel"
        transition={{ type: 'spring', duration: 0.4 }}
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 300 }}
        exit={{ opacity: 0, width: 0 }}>
        <ul>
          <li>
            <button onClick={onAddFilterPanel}>Tag Filters</button>
          </li>
          <li>
            <button onClick={onExploreArea}>Explore Area</button>
          </li>
        </ul>  
      </motion.div>
    </>
  )

}

export default MenuPanel;