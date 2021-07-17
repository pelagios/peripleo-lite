import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import './HUD.scss';
import MenuPanel from './MenuPanel';

const HUD = props => {

  const [ isOpen, setIsOpen ] = useState(false);

  return (
    <div className="p6o-hud">
      <div className="p6o-magic-button" onClick={() => setIsOpen(!isOpen)}>
        <motion.img 
          src="the-magic-button.svg" 
          animate={{
            rotate: isOpen ? 90 : 0,
          }} />
      </div>

      <AnimatePresence exitBeforeEnter>
        {isOpen && <MenuPanel /> }
      </AnimatePresence>
    </div>
  )

}

export default HUD;