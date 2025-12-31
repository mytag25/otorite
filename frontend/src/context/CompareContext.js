import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);
  const maxCompare = 3;

  const addToCompare = (vehicle) => {
    if (compareList.length >= maxCompare) return false;
    if (compareList.find(v => v.id === vehicle.id)) return false;
    setCompareList([...compareList, vehicle]);
    return true;
  };

  const removeFromCompare = (vehicleId) => {
    setCompareList(compareList.filter(v => v.id !== vehicleId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (vehicleId) => {
    return compareList.some(v => v.id === vehicleId);
  };

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare, maxCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
