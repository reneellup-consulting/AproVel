import { NotificationSwipeableRow } from '@/components/notification-swipeable-row';
import { useAppColors } from '@/hooks/useAppColors';
import { NotificationItem } from '@/hooks/useNotifications';
import { AppColors } from '@/interfaces/color';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  item: NotificationItem;
  index: number;
  onPress: (item: NotificationItem) => void;
  onMarkAsRead: (item: NotificationItem) => void;
}

export function NotificationListItem({
  item,
  index,
  onPress,
  onMarkAsRead,
}: Props) {
  const colors = useAppColors();
  const styles = makeStyles(colors);

  let iconName: any = 'information-circle-outline';
  let iconColor = colors.primary;

  if (item.type === 'success') {
    iconName = 'checkmark-circle-outline';
    iconColor = '#10B981';
  } else if (item.type === 'alert') {
    iconName = 'alert-circle-outline';
    iconColor = colors.red;
  }

  const ItemContent = (
    <View
      style={{
        backgroundColor: item.is_read ? colors.background : colors.accent,
      }}
    >
      <TouchableOpacity
        style={[
          styles.itemContainer,
          !item.is_read && styles.unreadItem,
          index === 0 && {
            borderTopWidth: 1,
            borderTopColor: colors.border,
          },
        ]}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View
            style={[styles.iconCircle, { backgroundColor: colors.background }]}
          >
            <Ionicons name={iconName} size={20} color={iconColor} />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text
              style={[styles.title, !item.is_read && styles.boldTitle]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
        </View>

        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </View>
  );

  return (
    <NotificationSwipeableRow item={item} onMarkAsRead={onMarkAsRead}>
      {ItemContent}
    </NotificationSwipeableRow>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    itemContainer: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.background,
      alignItems: 'flex-start',
    },
    unreadItem: {
      backgroundColor: colors.accent,
    },
    iconContainer: {
      marginRight: 12,
      marginTop: 2,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    contentContainer: {
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    title: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      color: colors.foreground,
      flex: 1,
      marginRight: 8,
    },
    boldTitle: {
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    dateText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 11,
      color: colors.mutedForeground,
    },
    message: {
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.red,
      marginLeft: 8,
      marginTop: 6,
    },
  });
