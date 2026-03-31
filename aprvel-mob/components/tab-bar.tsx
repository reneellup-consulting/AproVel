import { useLinkBuilder } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { useAppColors } from '@/hooks/useAppColors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppColors } from '@/interfaces/color';
import { Colors } from '@/theme/colors';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabBarButton from './tab-bar-button';
import { useTabBarContext } from './tab-bar-provider';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { buildHref } = useLinkBuilder();
  const { width } = useWindowDimensions();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { tabBarType } = useTabBarContext();

  let isFloating = false; // Default docked

  if (tabBarType === 'automatic') {
    isFloating = insets.bottom > 0;
  } else if (tabBarType === 'floating') {
    isFloating = true;
  }
  // Else docked (default)

  const styles = makeStyles(colors, colorScheme, insets.bottom, isFloating);

  // 1. Calculate Tab Width
  // If floating, the total width is reduced by the horizontal margins (20 * 2 = 40)
  const availableWidth = isFloating ? width - 40 : width;
  const tabWidth = availableWidth / state.routes.length;

  // 2. Reanimated Shared Value
  const translateX = useSharedValue(0);

  // 3. Update position when index changes
  React.useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, {
      damping: 15,
      stiffness: 150,
      mass: 0.8,
    });
  }, [state.index, tabWidth, translateX]);

  // 4. Create Animated Style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBarContent}>
        {/* Animated Indicator Bar */}
        {!isFloating && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                height: 2,
                width: tabWidth,
                backgroundColor: colors.primary,
                zIndex: 1,
              },
              animatedStyle,
            ]}
          />
        )}

        {/* Floating Tab Background Slider */}
        {isFloating && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: tabWidth,
                backgroundColor: colors.primary,
                zIndex: 0,
                borderRadius: 10,
              },
              animatedStyle,
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabBarButton
              key={route.key}
              routeName={route.name}
              isFocused={isFocused}
              isFloating={isFloating}
              label={label}
              href={buildHref(route.name, route.params)}
              testID={options.tabBarButtonTestID}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (
  colors: AppColors,
  colorScheme: 'light' | 'dark',
  bottomInset: number,
  isFloating: boolean,
) =>
  StyleSheet.create({
    tabBarContainer: {
      position: 'absolute',
      bottom: isFloating ? Math.max(bottomInset, 40) : 0,
      left: isFloating ? 20 : 0,
      right: isFloating ? 20 : 0,
      height: isFloating ? 60 : 79 + bottomInset,
      borderRadius: isFloating ? 10 : 0,
      // borderWidth: isFloating ? 0.5 : 0,
      borderColor: colors.border,
      // Shadow for floating effect
      // shadowColor: '#000',
      // shadowOffset: {
      //   width: 0,
      //   height: 10,
      // },
      // shadowOpacity: isFloating ? 0.25 : 0, // Increased from 0.1
      // shadowRadius: 20, // Increased from 10
      // elevation: isFloating ? 10 : 0, // Increased from 5
      backgroundColor: isFloating ? 'transparent' : colors.accent, // Avoid double background if floating (shadow needs shape, but content has bg)
    },
    tabBarContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isFloating
        ? colorScheme === 'dark'
          ? Colors.light.background + 'CC'
          : Colors.dark.background + 'CC'
        : colors.accent,
      height: '100%',
      width: '100%',
      borderRadius: isFloating ? 10 : 0,
      overflow: 'hidden',
      paddingBottom: isFloating ? 0 : bottomInset,
    },
  });
