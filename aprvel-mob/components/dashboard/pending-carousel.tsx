import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { PurchaseOrder } from '@/interfaces/db-types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface PendingCarouselProps {
  orders: PurchaseOrder[];
  onPressOrder: (id: string) => void;
  onSeeAll: () => void;
}

export const PendingCarousel = ({
  orders,
  onPressOrder,
  onSeeAll,
}: PendingCarouselProps) => {
  const colors = useAppColors();
  const styles = getCarouselStyles(colors);

  // --- Constants ---
  const MAX_VISIBLE_CARDS = 10;
  const CARD_WIDTH = 300;
  const CARD_MARGIN_HORIZONTAL = 6;
  const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN_HORIZONTAL * 2;

  // --- Derived State ---
  const shouldShowSeeMore = orders.length > MAX_VISIBLE_CARDS;
  const displayOrders = orders.slice(0, MAX_VISIBLE_CARDS);
  const remainingCount = orders.length - MAX_VISIBLE_CARDS;
  const totalItemCount = displayOrders.length + (shouldShowSeeMore ? 1 : 0);

  // --- Animation State ---
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / SNAP_INTERVAL);
    setActiveIndex(index);
  };

  if (!orders.length) return null;

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Pending Approvals</Text>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={onSeeAll}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>See All ({orders.length})</Text>
          <Ionicons name='chevron-forward' size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Horizontal ScrollView */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate='fast'
        snapToInterval={SNAP_INTERVAL}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll },
        )}
      >
        {displayOrders.map((order, index) => {
          const isActive = index === activeIndex;
          const totalAmount =
            order.order_lines?.reduce(
              (sum, line) => sum + (line.total || 0),
              0,
            ) ||
            order.amount ||
            0;

          return (
            <TouchableOpacity
              key={`${order.id}-${index}`}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => onPressOrder(order.id)}
              activeOpacity={0.9}
            >
              <View style={styles.vectorContainer}>
                <MaterialCommunityIcons
                  name={
                    order.po_type === 'Fuel'
                      ? 'gas-station'
                      : 'package-variant-closed'
                  }
                  size={140}
                  color={colors.mutedForeground}
                  style={{ opacity: 0.08 }}
                />
              </View>

              <View style={styles.topRow}>
                <Text style={styles.poText}>{order.source_no}</Text>
                <View style={styles.dateContainer}>
                  <Entypo
                    name='calendar'
                    size={12}
                    color={colors.mutedForeground}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.dateText}>
                    {formatDate(order.entry_date)}
                  </Text>
                </View>
              </View>

              <Text style={styles.vendorName} numberOfLines={2}>
                {order.vendor?.toUpperCase()}
              </Text>

              <View style={styles.detailsRow}>
                <Text style={styles.detailText} numberOfLines={1}>
                  {order.driver || 'REQUESTER'}
                </Text>
                <Ionicons
                  name='arrow-forward'
                  size={12}
                  color={isActive ? '#10B981' : colors.mutedForeground}
                  style={{ marginHorizontal: 6 }}
                />
                <Text style={styles.detailText} numberOfLines={1}>
                  {order.status || 'FOR APPROVAL'}
                </Text>
              </View>

              <Text style={styles.amountText}>
                {formatCurrency(totalAmount)}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* "See More" Card */}
        {shouldShowSeeMore && (
          <TouchableOpacity
            style={styles.seeMoreCard}
            onPress={onSeeAll}
            activeOpacity={0.9}
          >
            <View style={styles.seeMoreIconCircle}>
              <Ionicons name='add' size={32} color={colors.foreground} />
            </View>
            <View style={styles.seeMoreContent}>
              <Text style={styles.seeMoreTitle}>See More</Text>
              <Text style={styles.seeMoreSubtitle}>
                See {remainingCount} more approvals
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Pagination Dots */}
      {totalItemCount > 1 && (
        <View style={styles.paginationContainer}>
          {Array.from({ length: totalItemCount }).map((_, i) => {
            const inputRange = [
              (i - 1) * SNAP_INTERVAL,
              i * SNAP_INTERVAL,
              (i + 1) * SNAP_INTERVAL,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 20, 6],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: [
                colors.mutedForeground,
                colors.primary,
                colors.mutedForeground,
              ],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity, backgroundColor },
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
};

// --- Styles ---
const getCarouselStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: { marginBottom: 24, marginTop: 12 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    headerTitle: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 18,
      color: colors.foreground,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.accent,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 2,
    },
    seeAllText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      color: colors.primary,
    },
    scrollContent: { paddingHorizontal: 12, paddingBottom: 8 },
    card: {
      width: 300,
      backgroundColor: colors.accent,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 6,
      borderWidth: 1,
      borderColor: 'transparent',
      elevation: 2,
      height: 170,
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    cardActive: {
      backgroundColor: colors.card,
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    seeMoreCard: {
      width: 300,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 6,
      height: 170,
    },
    vectorContainer: {
      position: 'absolute',
      right: -30,
      bottom: -35,
      transform: [{ rotate: '-10deg' }],
    },
    seeMoreIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    seeMoreContent: { alignItems: 'center' },
    seeMoreTitle: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 16,
      color: colors.foreground,
      marginBottom: 4,
    },
    seeMoreSubtitle: {
      fontFamily: 'Inter_500Medium',
      fontSize: 13,
      color: colors.mutedForeground,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    poText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
      color: colors.mutedForeground,
    },
    dateContainer: { flexDirection: 'row', alignItems: 'center' },
    dateText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      color: colors.mutedForeground,
    },
    vendorName: {
      fontFamily: 'Inter_700Bold',
      fontSize: 16,
      color: colors.cardForeground,
      lineHeight: 22,
      marginBottom: 8,
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    detailText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 11,
      color: colors.mutedForeground,
      textTransform: 'uppercase',
    },
    amountText: {
      fontFamily: 'Inter_700Bold',
      fontSize: 28,
      color: colors.foreground,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
      height: 12,
    },
    dot: { height: 6, borderRadius: 3, marginHorizontal: 3 },
  });
