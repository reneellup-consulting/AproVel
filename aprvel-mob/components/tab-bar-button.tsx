import { useAppColors } from '@/hooks/useAppColors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppColors } from '@/interfaces/color';
import { Colors } from '@/theme/colors';
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { PlatformPressable } from '@react-navigation/elements';
import React from 'react';
import { GestureResponderEvent, StyleSheet, Text } from 'react-native';

type IconProps = {
  color: string;
  size?: number;
  style?: any;
};

const iconMap: Record<string, (props: IconProps) => React.JSX.Element> = {
  index: (props) => (
    <Feather name='home' size={28} style={{ alignSelf: 'center' }} {...props} />
  ),
  search: (props) => (
    <Feather
      name='search'
      size={28}
      archiprof
      style={{ alignSelf: 'center' }}
      {...props}
    />
  ),
  pending: (props) => (
    <AntDesign
      name='field-time'
      size={28}
      style={{ alignSelf: 'center' }}
      {...props}
    />
  ),
  history: (props) => (
    <Feather
      name='archive'
      size={28}
      style={{ alignSelf: 'center' }}
      {...props}
    />
  ),
  profile: (props) => (
    <Feather name='user' size={28} style={{ alignSelf: 'center' }} {...props} />
  ),
};

type TabBarButtonProps = {
  routeName: string;
  isFocused: boolean;
  isFloating: boolean;
  label: string | any;
  href: string | undefined;
  testID?: string;
  accessibilityLabel?: string;
  onPress: (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent,
  ) => void;
  onLongPress: (e: GestureResponderEvent) => void;
};

const TabBarButton = ({
  routeName,
  isFocused,
  isFloating,
  label,
  href,
  testID,
  accessibilityLabel,
  onPress,
  onLongPress,
}: TabBarButtonProps) => {
  const IconComponent = iconMap[routeName];

  const { colorScheme } = useColorScheme();

  const colors = useAppColors();

  const styles = makeStyles(colors);

  return (
    <PlatformPressable
      href={href}
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.tabButton,
        {
          backgroundColor: isFloating
            ? 'transparent'
            : isFocused
              ? colors.secondary
              : colors.accent,
          borderTopWidth: isFloating ? 0 : 2,
          borderBottomWidth: isFloating ? 0 : 0.5,
          borderColor: colors.border,
        },
      ]}
    >
      {IconComponent ? (
        IconComponent({
          color: isFocused
            ? isFloating
              ? '#fff'
              : colors.primary
            : isFloating
              ? colorScheme === 'dark'
                ? Colors.light.foreground
                : Colors.dark.foreground
              : colors.foreground,
        })
      ) : (
        <MaterialCommunityIcons
          name='help-circle-outline'
          size={28}
          color={isFloating ? '#fff' : colors.foreground}
          style={{ alignSelf: 'center' }}
        />
      )}

      <Text
        style={{
          color: isFocused
            ? isFloating
              ? '#fff'
              : colors.primary
            : isFloating
              ? colorScheme === 'dark'
                ? Colors.light.foreground
                : Colors.dark.foreground
              : colors.foreground,
          fontSize: 12,
          fontFamily: isFocused ? 'Inter_600SemiBold' : 'Inter_400Regular',
          textAlign: 'center',
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </PlatformPressable>
  );
};

export default TabBarButton;

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    tabButton: {
      flex: 1,
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
    },
  });
