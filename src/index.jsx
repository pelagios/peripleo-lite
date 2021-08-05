import React from 'react';
import ReactDOM from 'react-dom';
import Peripleo from './Peripleo';
import { StoreContextProvider } from './store/StoreContext';

ReactDOM.render(
  <StoreContextProvider>  
    <Peripleo />
  </StoreContextProvider>

, document.getElementById('app'));