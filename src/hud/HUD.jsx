import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import './HUD.scss';
import MenuPanel from './MenuPanel';

const HUD = props => {

  const [ isOpen, setIsOpen ] = useState(false);

  return (
    <div className="p6o-hud">
      <div className="p6o-magic-button" onClick={() => setIsOpen(!isOpen)}>
        <img src="the-magic-button.svg" />
      </div>

      <AnimatePresence exitBeforeEnter>
        {isOpen && <MenuPanel /> }
      </AnimatePresence>
    </div>
  )

}

export default HUD;