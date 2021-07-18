import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MenuPanel from './MenuPanel';
import Stack from './Stack';

import './HUD.scss';

const HUD = props => {

  const [ menuOpen, setMenuOpen ] = useState(false);
  const [ stackOpen, setStackOpen ] = useState(false);

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
          {menuOpen && <MenuPanel />}
        </AnimatePresence>

        <AnimatePresence>        
          {stackOpen && <Stack />}
        </AnimatePresence>
      </div>
    </div>
  )

}

export default HUD;