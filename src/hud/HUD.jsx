import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MenuPanel from './MenuPanel';

import './HUD.scss';

const HUD = props => {

  const [ menuOpen, setMenuOpen ] = useState(false);

  const [ stackOpen, setStackOpen ] = useState(false);

  const [ panels, setPanels ] = useState([]);

  const toggleControls = () => {
    // Staggered close or open
    if (menuOpen) {
      setStackOpen(false);
      setTimeout(() => setMenuOpen(false), 150);
    } else {
      setMenuOpen(true);
      setTimeout(() => setStackOpen(true), 150);
    }
  }

  const onAddPanel = panel => {
    setPanels([...panels, panel ]);
  }

  return (
    <div className="p6o-hud">
      <div className="p6o-glass">
        {/* Glass overlay elements */}
      </div>
      
      <div className="p6o-controls">
        <div 
          className="p6o-magic-button noselect" 
          onClick={toggleControls}>

          <motion.img 
            src="the-magic-button.svg" 
            animate={{
              rotate: menuOpen ? 90 : 0,
            }} />
        </div>

        <AnimatePresence>
          {menuOpen && <MenuPanel onAddPanel={onAddPanel} />}
        </AnimatePresence>

        {stackOpen && 
          <div className="p6o-stack"> 
            <AnimatePresence>
              {panels.map((panel, idx) => 
                <motion.div
                  key={idx}
                  className="p6o-stackpanel-wrapper"
                  transition={{ type: 'spring', duration: 0.4 }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 150 }}
                  exit={{ opacity: 0, hieght: 0 }}>
                  
                  {panel}

                </motion.div>
            
              )}
            </AnimatePresence>
          </div>
        }
      </div>
    </div>
  )

}

export default HUD;