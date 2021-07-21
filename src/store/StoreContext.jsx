import React, { createContext } from 'react';
import Store from './Store';

export const StoreContext = createContext();

export const StoreContextProvider = ({ children }) => {
  const value = { store: new Store() };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}