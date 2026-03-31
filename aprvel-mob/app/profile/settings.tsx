import { ScreenHeader } from '@/components/screen-header';
import { useTabBarContext } from '@/components/tab-bar-provider';
import { useAppColors } from '@/hooks/useAppColors';
import { useColorScheme } from '@/hooks/useColorScheme'; // Import custom hook
import { useFinalHeaderHeight } from '@/hooks/useFinalHeaderHeight';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SettingScreen = () => {
  const finalHeaderHeight = useFinalHeaderHeight();

  // Use our custom hook which now exposes 'themePreference' and 'setTheme'
  const { themePreference, setTheme, colorScheme } = useColorScheme();

  // Derived state for the switches
  const isSystemTheme = themePreference === 'system';
  const isDarkMode = colorScheme === 'dark';

  // Mock states for other settings
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pushNotifsEnabled, setPushNotifsEnabled] = useState(true);
  const [emailNotifsEnabled, setEmailNotifsEnabled] = useState(false);

  const { tabBarType, setTabBarType } = useTabBarContext();

  // ONE LINE to get all your semantic colors
  // These will automatically update when Dark Mode changes
  const colors = useAppColors();

  const handleSystemToggle = (value: boolean) => {
    if (value) {
      setTheme('system');
    } else {
      // If turning system OFF, snap to the current resolved color
      setTheme(colorScheme);
    }
  };

  const handleManualToggle = (value: boolean) => {
    // Only works if system is off
    setTheme(value ? 'dark' : 'light');
  };

  return (
    <>
      <ScreenHeader
        title='Settings'
        enableBackground={true}
        showBackButton={true}
      />
      <View
        style={[
          styles.container,
          { paddingTop: finalHeaderHeight, backgroundColor: colors.background },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Section: Appearance --- */}
          <Text
            style={[styles.sectionTitle, { color: colors.mutedForeground }]}
          >
            Appearance
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.accent,
                borderColor: colors.border,
              },
            ]}
          >
            {/* System Mode Switch */}
            <SettingToggle
              label='Automatic (System)'
              icon='phone-portrait-outline'
              value={isSystemTheme}
              onValueChange={handleSystemToggle}
              textColor={colors.accentForeground}
              iconColor={colors.mutedForeground}
              colors={colors}
            />

            {/* CONDITIONAL RENDERING: Only show if System Theme is FALSE */}
            {!isSystemTheme && (
              <>
                <View
                  style={[styles.separator, { backgroundColor: colors.border }]}
                />

                {/* Dark Mode Switch */}
                <SettingToggle
                  label='Dark Mode'
                  icon='moon-outline'
                  value={isDarkMode}
                  onValueChange={handleManualToggle}
                  textColor={colors.accentForeground}
                  iconColor={colors.mutedForeground}
                  colors={colors}
                />
              </>
            )}
          </View>

          {/* --- Section: Navigation --- */}
          <Text
            style={[styles.sectionTitle, { color: colors.mutedForeground }]}
          >
            Tab Bar Style
          </Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.accent,
                borderColor: colors.border,
              },
            ]}
          >
            <SettingToggle
              label='Adaptive (System)'
              icon='hardware-chip-outline'
              value={tabBarType === 'automatic'}
              onValueChange={() => setTabBarType('automatic')}
              textColor={colors.accentForeground}
              iconColor={colors.mutedForeground}
              colors={colors}
              isRadio
            />
            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />
            <SettingToggle
              label='Floating'
              icon='layers-outline'
              value={tabBarType === 'floating'}
              onValueChange={() => setTabBarType('floating')}
              textColor={colors.accentForeground}
              iconColor={colors.mutedForeground}
              colors={colors}
              isRadio
            />
            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />
            <SettingToggle
              label='Docked'
              icon='tablet-landscape-outline'
              value={tabBarType === 'docked'}
              onValueChange={() => setTabBarType('docked')}
              textColor={colors.accentForeground}
              iconColor={colors.mutedForeground}
              colors={colors}
              isRadio
            />
          </View>

          {/* --- Section: Security --- */}
          {/* <Text
            style={[styles.sectionTitle, { color: colors.mutedForeground }]}
          >
            Security
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.accent, borderColor: colors.border },
            ]}
          >
            <SettingToggle
              label='Biometric Login'
              icon='finger-print-outline'
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              textColor={colors.accentForeground}
              iconColor={colors.mutedForeground}
              colors={colors}
            />
          </View>

          {/* --- Section: Notifications --- */}
          {/*
          <Text
            style={[styles.sectionTitle, { color: colors.mutedForeground }]}
          >
            Notifications
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.accent, borderColor: colors.border },
            ]}
          >
            <SettingToggle
              label='Push Notifications'
              icon='notifications-outline'
              value={pushNotifsEnabled}
              onValueChange={setPushNotifsEnabled}
              textColor={colors.accentForeground}
              iconColor={colors.mutedForeground}
              colors={colors}
            />
            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />
            <SettingToggle
              label='Email Alerts'
              icon='mail-outline'
              value={emailNotifsEnabled}
              onValueChange={setEmailNotifsEnabled}
              textColor={colors.accentForeground}
              iconColor={colors.mutedForeground}
              colors={colors}
            />
          </View>
          */}
        </ScrollView>
      </View>
    </>
  );
};

// --- Helper Component ---

const SettingToggle = ({
  label,
  icon,
  value,
  onValueChange,
  textColor,
  iconColor,
  disabled = false,
  colors,
  isRadio = false,
}: {
  label: string;
  icon: any;
  value: boolean;
  onValueChange: (val: boolean) => void;
  textColor: string;
  iconColor: string;
  disabled?: boolean;
  colors: any;
  isRadio?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.settingItem, disabled && styles.disabledItem]}
    onPress={() => {
      if (!disabled) {
        onValueChange(!value);
      }
    }}
    activeOpacity={0.7}
    delayPressIn={50}
  >
    <View style={styles.itemLeft}>
      <Ionicons
        name={icon}
        size={22}
        color={disabled ? iconColor + '50' : iconColor} // Add transparency if disabled
      />
      <Text
        style={[
          styles.itemText,
          { color: textColor },
          disabled && { opacity: 0.5 },
        ]}
      >
        {label}
      </Text>
    </View>
    {isRadio ? (
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: value ? colors.primary : colors.mutedForeground,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {value && (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.primary,
            }}
          />
        )}
      </View>
    ) : (
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.border, // You might want to make this dynamic too
          true: disabled ? colors.mutedForeground : colors.primary,
        }}
        thumbColor={'#fff'}
        // Opacity change for disabled feel
        style={{ opacity: disabled ? 0.6 : 1 }}
      />
    )}
  </TouchableOpacity>
);

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: -16,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    height: 56,
  },
  disabledItem: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  separator: {
    height: 1,
    marginLeft: 50,
  },
});
