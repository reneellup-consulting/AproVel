import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type TabBarType = 'automatic' | 'floating' | 'docked';

export function useTabBarSettings() {
  const [tabBarType, setTabBarTypeState] = useState<TabBarType>('automatic');
  const [isTabBarSettingsLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedType = await AsyncStorage.getItem('tab-bar-type');
        if (
          storedType === 'automatic' ||
          storedType === 'floating' ||
          storedType === 'docked'
        ) {
          setTabBarTypeState(storedType);
        }
      } catch (error) {
        console.error('Failed to load tab bar settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  const setTabBarType = async (type: TabBarType) => {
    try {
      setTabBarTypeState(type);
      await AsyncStorage.setItem('tab-bar-type', type);
    } catch (error) {
      console.error('Failed to save tab bar settings:', error);
    }
  };

  return {
    tabBarType,
    setTabBarType,
    isTabBarSettingsLoaded,
  };
}
