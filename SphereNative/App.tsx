import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const AppContent = () => {
  const { theme, colors } = useTheme();
  
  return (
    <NavigationContainer
      theme={{
        dark: theme === 'dark',
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' as const },
          medium: { fontFamily: 'System', fontWeight: '500' as const },
          bold: { fontFamily: 'System', fontWeight: '700' as const },
          heavy: { fontFamily: 'System', fontWeight: '900' as const },
        },
      }}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}