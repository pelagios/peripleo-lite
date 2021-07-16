import React from 'react';
import { motion } from 'framer-motion';

const MenuPanel = props => {

  return (
    <motion.div
      className="p6o-hud-menupanel"
      transition={{ type: 'spring', duration: 0.4 }}
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 400 }}
      exit={{ opacity: 0, width: 0 }} />
  )

}

export default MenuPanel;