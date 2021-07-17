import React from 'react';
import { motion } from 'framer-motion';

import './Stack.scss';

const Stack = props => {

  return (
    <motion.div 
      className="p6o-stack"
      transition={{ type: 'spring', duration: 0.4 }}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 200 }}
      exit={{ opacity: 0, height: 0 }}>

    </motion.div>
  )

}

export default Stack;