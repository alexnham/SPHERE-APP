import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ViewMode = 'detailed' | 'simple';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isSimpleView: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

const STORAGE_KEY = 'viewMode';

export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved view mode from AsyncStorage
  useEffect(() => {
    const loadViewMode = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'simple' || saved === 'detailed') {
          setViewMode(saved);
        }
      } catch (error) {
        console.error('Error loading view mode:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadViewMode();
  }, []);

  // Save view mode to AsyncStorage when it changes
  const handleSetViewMode = async (mode: ViewMode) => {
    try {
      setViewMode(mode);
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving view mode:', error);
      // Still update state even if storage fails
      setViewMode(mode);
    }
  };

  return (
    <ViewModeContext.Provider value={{ 
      viewMode, 
      setViewMode: handleSetViewMode, 
      isSimpleView: viewMode === 'simple' 
    }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};
