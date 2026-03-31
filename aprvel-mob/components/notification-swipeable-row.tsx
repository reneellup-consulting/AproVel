import { useAppColors } from '@/hooks/useAppColors';
import { NotificationItem } from '@/hooks/useNotifications';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';

interface Props {
  item: NotificationItem;
  children: React.ReactNode;
  onMarkAsRead: (item: NotificationItem) => void;
}

export function NotificationSwipeableRow({
  item,
  children,
  onMarkAsRead,
}: Props) {
  const colors = useAppColors();
  const swipeableRow = useRef<Swipeable>(null);

  const close = () => {
    swipeableRow.current?.close();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    // If already read, don't show the "Mark as Read" action
    if (item.is_read) return null;

    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={{ width: 80, flexDirection: 'row' }}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
          <RectButton
            style={[styles.rightAction, { backgroundColor: colors.primary }]}
            onPress={() => {
              close();
              onMarkAsRead(item);
            }}
          >
            <Ionicons name='checkmark-done' size={24} color='#fff' />
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRow}
      friction={2}
      enableTrackpadTwoFingerGesture
      rightThreshold={40}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rightAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
