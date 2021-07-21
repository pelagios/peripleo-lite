import React from 'react';
import ReactDOM from 'react-dom';
import PeripleoLite from './PeripleoLite';
import { StoreContextProvider } from './store/StoreContext';

ReactDOM.render(
  <StoreContextProvider>  
    <PeripleoLite />
  </StoreContextProvider>

, document.getElementById('app'));