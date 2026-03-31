import { TabBarType } from '@/hooks/useTabBarSettings';
import React, { createContext, useContext } from 'react';

type TabBarContextType = {
  tabBarType: TabBarType;
  setTabBarType: (type: TabBarType) => Promise<void>;
  isLoaded: boolean;
};

const TabBarContext = createContext<TabBarContextType>({
  tabBarType: 'automatic',
  setTabBarType: async () => {},
  isLoaded: false,
});

export const TabBarProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: TabBarContextType;
}) => {
  return (
    <TabBarContext.Provider value={value}>{children}</TabBarContext.Provider>
  );
};

export const useTabBarContext = () => useContext(TabBarContext);
