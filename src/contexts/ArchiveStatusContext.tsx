'use client';

import React, { createContext, useContext } from 'react';

interface ArchiveStatusContextType {
  isGameArchived: boolean;
}

const ArchiveStatusContext = createContext<ArchiveStatusContextType | undefined>(undefined);

export function ArchiveStatusProvider({ 
  children, 
  isGameArchived 
}: { 
  children: React.ReactNode; 
  isGameArchived: boolean;
}) {
  return (
    <ArchiveStatusContext.Provider value={{ isGameArchived }}>
      {children}
    </ArchiveStatusContext.Provider>
  );
}

export function useArchiveStatus() {
  const context = useContext(ArchiveStatusContext);
  if (context === undefined) {
    throw new Error('useArchiveStatus must be used within ArchiveStatusProvider');
  }
  return context;
}
