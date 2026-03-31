import { NotificationListItem } from '@/components/notification-list-item';
import { ScreenHeader } from '@/components/screen-header';
import { useAppColors } from '@/hooks/useAppColors';
import { useFinalHeaderHeight } from '@/hooks/useFinalHeaderHeight'; // Imported hook
import { NotificationItem, useNotifications } from '@/hooks/useNotifications';
import { AppColors } from '@/interfaces/color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const styles = makeStyles(colors);

  // 1. Get the final header height (SafeArea + Header Content)
  const finalHeaderHeight = useFinalHeaderHeight();

  const {
    notifications,
    isLoading,
    refetch,
    markAsRead,
    markAllAsRead,
    markAllAsReadAsync,
  } = useNotifications();

  const handlePressNotification = (item: NotificationItem) => {
    if (!item.is_read) {
      markAsRead(item.$id);
    }
    if (item.related_order_id) {
      router.push(`../order/${item.related_order_id}`);
    }
  };

  // 2. Added 'index' to params to detect the first item
  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationItem;
    index: number;
  }) => (
    <NotificationListItem
      item={item}
      index={index}
      onPress={handlePressNotification}
      onMarkAsRead={(i) => markAsRead(i.$id)}
    />
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title='Notifications'
        enableBackground={true}
        showNotication={false}
        showBackButton={true}
        headerRight={() => (
          <TouchableOpacity
            hitSlop={50}
            onPress={async () => {
              try {
                if (markAllAsReadAsync) {
                  await markAllAsReadAsync();
                }
              } catch (e) {
                console.error('Mark all as read failed:', e);
              }
            }}
          >
            <Text style={styles.markReadText}>Read All</Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={[styles.center, { marginTop: finalHeaderHeight }]}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.$id}
          renderItem={renderItem}
          // 4. Apply marginTop to the FlatList itself so it starts below the header
          style={{ marginTop: finalHeaderHeight }}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={[colors.primary]}
              progressBackgroundColor={colors.background}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialCommunityIcons
                name='bell-sleep-outline'
                size={48}
                color={colors.border}
              />
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingBottom: 40,
      // Removed paddingTop since we are using marginTop on the list itself
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    emptyText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 15,
      color: colors.mutedForeground,
      marginTop: 12,
    },
    markReadText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      color: colors.primary,
    },
  });
