import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface TabItem {
  id: string;
  label: string;
}

interface TabHeaderProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  getBadgeCount?: (id: string) => number;
  showSearch?: boolean;
  showFilter?: boolean;
  onFilterPress?: () => void;
  filterCount?: number;
  activeColor?: string;
  fullWidth?: boolean;
  backgroundColor?: string; // New Prop
  style?: ViewStyle;
}

export const TabHeader = ({
  tabs,
  activeTab,
  onTabChange,
  getBadgeCount,
  showSearch = true,
  showFilter = false,
  onFilterPress,
  filterCount,
  activeColor,
  fullWidth = false,
  backgroundColor, // Destructure new prop
  style,
}: TabHeaderProps) => {
  const colors = useAppColors();
  const styles = makeStyles(colors);
  const router = useRouter();

  const finalActiveColor = activeColor || colors.primary;
  // Use passed background color, or fall back to default from styles
  const containerStyle = [
    styles.tabsHeader,
    backgroundColor ? { backgroundColor } : undefined,
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={[styles.tabsList, fullWidth && styles.tabsListFull]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = getBadgeCount ? getBadgeCount(tab.id) : 0;

          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              onPress={() => onTabChange(tab.id)}
              style={[
                styles.tabItem,
                fullWidth ? styles.tabItemFull : { marginRight: 24 },
                isActive && { borderBottomColor: finalActiveColor },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={[
                    styles.tabText,
                    isActive && {
                      color: finalActiveColor,
                      fontFamily: 'Inter_600SemiBold',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.badge,
                      isActive
                        ? { backgroundColor: finalActiveColor }
                        : styles.badgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        isActive
                          ? styles.badgeTextActive
                          : styles.badgeTextInactive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {showFilter && (
          <TouchableOpacity style={styles.actionButton} onPress={onFilterPress}>
            <Ionicons name='filter' size={20} color={colors.mutedForeground} />
            {(filterCount || 0) > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{filterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {showSearch && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/search')}
          >
            <Ionicons name='search' size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    tabsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background, // Default background
      zIndex: 10,
    },
    tabsList: {
      flexDirection: 'row',
      paddingLeft: 16,
      flex: 1,
    },
    tabsListFull: {
      paddingLeft: 0,
      justifyContent: 'space-between',
    },
    tabItem: {
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
      marginBottom: -1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabItemFull: {
      flex: 1,
      marginRight: 0,
    },
    tabText: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    badge: {
      marginLeft: 6,
      borderRadius: 12,
      height: 20,
      minWidth: 20,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeInactive: {
      backgroundColor: colors.border,
    },
    badgeText: {
      fontSize: 10,
      fontFamily: 'Inter_700Bold',
      textAlign: 'center',
      lineHeight: 12,
    },
    badgeTextInactive: {
      color: colors.mutedForeground,
    },
    badgeTextActive: {
      color: '#FFFFFF',
    },
    searchButton: {
      padding: 4,
    },
    actionButton: {
      padding: 4,
      position: 'relative',
    },
    filterBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.red,
      borderRadius: 10,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 2,
    },
    filterBadgeText: {
      color: 'white',
      fontSize: 10,
      fontFamily: 'Inter_700Bold',
      lineHeight: 12,
    },
  });
