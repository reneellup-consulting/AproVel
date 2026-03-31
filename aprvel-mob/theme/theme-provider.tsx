import { Colors } from '@/theme/colors';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as RNThemeProvider,
} from '@react-navigation/native';
import React, { createContext, useContext } from 'react';

// Define the shape of our Context
type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  themePreference: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
};

// Create Context with dummy defaults
const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  themePreference: 'system',
  setTheme: async () => {},
});

// Props for the Provider
type Props = {
  children: React.ReactNode;
  value: ThemeContextType; // Accepts the state from RootLayout
};

export const ThemeProvider = ({ children, value }: Props) => {
  const { colorScheme } = value;

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.primary,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
      notification: Colors.light.red,
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.primary,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.border,
      notification: Colors.dark.red,
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      <RNThemeProvider
        value={colorScheme === 'dark' ? customDarkTheme : customLightTheme}
      >
        {children}
      </RNThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
