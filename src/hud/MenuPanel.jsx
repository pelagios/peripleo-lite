import React from 'react';
import { motion } from 'framer-motion';

import './MenuPanel.scss';

const MenuPanel = props => {

  const onAddFilterPanel = () =>
    props.onAddPanel(
      <div className="p6o-stackpanel filters"></div>
    )

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
            <button onClick={onAddFilterPanel}>Filters</button>
          </li>
          <li>
            <button>Explore Area</button>
          </li>
        </ul>  
      </motion.div>
    </>
  )

}

export default MenuPanel;