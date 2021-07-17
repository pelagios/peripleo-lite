import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Stack from './Stack';

import './MenuPanel.scss';

const MenuPanel = props => {

  const [ stackPanels, setStackPanels ] = useState([]);

  const [ isStackOpen, setIsStackOpen ] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsStackOpen(true), 150);
  }, []);

  const onAddPanel = panel =>
    setStackPanels([ ...stackPanels, panel ]);

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
            <button>Filters</button>
          </li>
          <li>
            <button>Explore Area</button>
          </li>
        </ul>  
      </motion.div>

      <AnimatePresence exitBeforeEnter>
        { isStackOpen && 
          <Stack>
            {stackPanels}
          </Stack>
        }
      </AnimatePresence>
    </>
  )

}

export default MenuPanel;