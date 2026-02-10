
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface EditContextType {
  isTextEditing: boolean;
  isImageEditing: boolean;
  setTextEditing: (val: boolean) => void;
  setImageEditing: (val: boolean) => void;
  toggleTextEditing: () => void;
  toggleImageEditing: () => void;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export const EditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [isImageEditing, setIsImageEditing] = useState(false);

  const toggleTextEditing = useCallback(() => setIsTextEditing(prev => !prev), []);
  const toggleImageEditing = useCallback(() => setIsImageEditing(prev => !prev), []);

  return (
    <EditContext.Provider value={{ 
      isTextEditing, 
      isImageEditing, 
      setTextEditing: setIsTextEditing, 
      setImageEditing: setIsImageEditing,
      toggleTextEditing,
      toggleImageEditing 
    }}>
      {children}
    </EditContext.Provider>
  );
};

export const useEdit = () => {
  const context = useContext(EditContext);
  if (!context) throw new Error('useEdit must be used within an EditProvider');
  return context;
};
