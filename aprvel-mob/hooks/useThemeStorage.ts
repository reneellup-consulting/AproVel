import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

export function useThemeStorage() {
  const systemColorScheme = useSystemColorScheme();

  const [themePreference, setThemePreference] =
    useState<ThemePreference>('system');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('app-theme');
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setThemePreference(storedTheme);
          setColorScheme(storedTheme);
        } else {
          setThemePreference('system');
          setColorScheme(systemColorScheme ?? 'light');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  // Listen for System changes
  useEffect(() => {
    if (themePreference === 'system') {
      setColorScheme(systemColorScheme ?? 'light');
    }
  }, [systemColorScheme, themePreference]);

  // Save the theme
  const setTheme = async (newTheme: ThemePreference) => {
    try {
      setThemePreference(newTheme);

      if (newTheme === 'system') {
        setColorScheme(systemColorScheme ?? 'light');
        await AsyncStorage.removeItem('app-theme');
      } else {
        setColorScheme(newTheme);
        await AsyncStorage.setItem('app-theme', newTheme);
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return {
    colorScheme,
    themePreference,
    setTheme,
    isThemeLoaded,
  };
}
