import { useAppColors } from '@/hooks/useAppColors';
import { useNotifications } from '@/hooks/useNotifications'; // Import hook
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  headerRight?: () => React.ReactNode;
  headerLeft?: () => React.ReactNode;
  enableBackground: boolean;
  showNotication?: boolean;
  showBackButton?: boolean;
};

export function ScreenHeader({
  title,
  headerRight,
  headerLeft,
  enableBackground,
  showNotication = true,
  showBackButton = false,
}: ScreenHeaderProps) {
  const colors = useAppColors();
  const router = useRouter();

  // Connect to global state
  const { unreadCount } = useNotifications();
  const hasUnread = unreadCount > 0;

  // Define Custom Back Button
  const BackButton = () => (
    <Pressable
      onPress={() => router.back()}
      hitSlop={{ top: 50, bottom: 50, left: 50, right: 50 }}
      style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.5 }]}
    >
      <Ionicons name='chevron-back' size={28} color={colors.primary} />
    </Pressable>
  );

  const NotificationButton = () => (
    <TouchableOpacity
      // Update: Navigate to the actual path
      onPress={() => router.push('/notifications')}
      style={styles.notificationButton}
      activeOpacity={0.7}
    >
      <Ionicons
        name='notifications-outline'
        size={24}
        color={colors.foreground}
      />
      {hasUnread && <View style={styles.badge} />}
    </TouchableOpacity>
  );

  return (
    <Stack.Screen
      options={{
        headerTitle: title,
        headerBackVisible: false,
        headerRight: () => (
          <View
            style={[
              styles.rightContainer,
              showNotication === false && { paddingRight: 0 },
            ]}
          >
            {headerRight ? headerRight() : null}
            {showNotication ? <NotificationButton /> : null}
          </View>
        ),
        headerLeft: headerLeft
          ? headerLeft
          : showBackButton
            ? () => <BackButton />
            : undefined,
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTintColor: colors.primary,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 18,
          color: colors.foreground,
        },
        headerBackground: () => (
          <View
            style={
              enableBackground
                ? [styles.headerBackground, { backgroundColor: colors.accent }]
                : null
            }
          />
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -12,
    marginRight: 4,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  notificationButton: {
    marginLeft: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
});
