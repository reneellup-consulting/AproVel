import { TabBar } from '@/components/tab-bar';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarHideOnKeyboard: true,
        animation: 'shift',
        transitionSpec: {
          animation: 'timing',
          config: {
            duration: 250,
          },
        },
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name='search'
        options={{
          title: 'Search',
        }}
      />
      <Tabs.Screen
        name='pending'
        options={{
          title: 'Pending',
        }}
      />
      <Tabs.Screen
        name='history'
        options={{
          title: 'History',
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
