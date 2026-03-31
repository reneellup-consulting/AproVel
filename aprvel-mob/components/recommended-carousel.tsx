import { Text } from '@/components/ui/text';
import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { ProcessedOrder } from '@/interfaces/db-types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Entypo, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export const RecommendedCarousel = ({
  orders,
  onPress,
}: {
  orders: ProcessedOrder[];
  onPress: (id: string) => void;
}) => {
  const colors = useAppColors();
  const styles = makeCarouselStyles(colors);

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (!orders.length) return null;

  const handleScroll = (event: any) => {
    const slideSize = 280 + 12; // Width + Margin
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Header with Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Recommended</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{orders.length} Waiting</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate='fast'
        snapToInterval={292} // Card width (280) + margin (12)
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {orders.map((order, index) => {
          const dateStr = formatDate(order.entry_date);
          const isActive = index === activeIndex;
          const isFuel = order.po_type === 'Fuel';
          const vectorIcon = isFuel ? 'gas-station' : 'package-variant-closed';

          return (
            <TouchableOpacity
              key={`${order.id || (order as any).$id || 'order'}-${index}`}
              style={[styles.card, !isActive && styles.cardInactive]}
              onPress={() => {
                const orderId =
                  order.id || (order as any).$id || (order as any).po_id;
                if (orderId) {
                  onPress(orderId);
                }
              }}
              activeOpacity={0.9}
            >
              {/* Vector Background */}
              <View style={styles.vectorContainer}>
                <MaterialCommunityIcons
                  name={vectorIcon}
                  size={140}
                  color={colors.mutedForeground}
                  style={{ opacity: 0.08 }}
                />
              </View>
              {/* Row 1: PO & Date */}
              <View style={styles.topRow}>
                <Text style={styles.poText}>
                  {order.source_no || 'PO-UNKNOWN'}
                </Text>
                <View style={styles.dateContainer}>
                  <Entypo
                    name='calendar'
                    size={12}
                    color={colors.mutedForeground}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.dateText}>{dateStr}</Text>
                </View>
              </View>

              {/* Row 2: Vendor Name */}
              <Text
                style={[
                  styles.vendorName,
                  !isActive && { color: colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {order.vendor?.toUpperCase() || 'UNKNOWN VENDOR'}
              </Text>

              {/* Row 3: Details */}
              <View style={styles.detailsRow}>
                <Text style={styles.detailText} numberOfLines={1}>
                  {order.unit_no ? `UNIT ${order.unit_no}` : 'GENERAL'}
                </Text>
                <Ionicons
                  name='arrow-forward'
                  size={12}
                  color={isActive ? '#10B981' : colors.mutedForeground}
                  style={{ marginHorizontal: 6 }}
                />
                <Text style={styles.detailText} numberOfLines={1}>
                  {order.driver?.toUpperCase() || order.ref_nos || 'NO DRIVER'}
                </Text>
              </View>

              {/* Row 4: Amount */}
              <Text
                style={[
                  styles.amountText,
                  !isActive && { color: colors.mutedForeground },
                ]}
              >
                {formatCurrency(order.calculatedTotal)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {orders.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// --- STYLES ---
const makeCarouselStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      marginBottom: 8,
      marginTop: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 16,
      gap: 8,
    },
    headerTitle: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 18,
      color: colors.foreground,
    },
    badgeContainer: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    badgeText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 10,
      color: colors.primaryForeground,
    },
    scrollContent: {
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    card: {
      width: 280,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 6,
      borderWidth: 1.5,
      borderColor: colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      justifyContent: 'space-between',
      height: 160,
      overflow: 'hidden',
    },
    vectorContainer: {
      position: 'absolute',
      right: -30,
      bottom: -35,
      zIndex: 0,
      transform: [{ rotate: '-10deg' }],
    },
    cardInactive: {
      backgroundColor: colors.accent,
      borderColor: colors.border,
      borderWidth: 1,
      shadowOpacity: 0,
      elevation: 0,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    poText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
      color: colors.mutedForeground,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
      color: colors.mutedForeground,
    },
    vendorName: {
      fontFamily: 'Inter_700Bold',
      fontSize: 16,
      color: colors.cardForeground,
      lineHeight: 24,
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    detailText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      color: colors.mutedForeground,
      lineHeight: 18,
      textTransform: 'uppercase',
    },
    amountText: {
      fontFamily: 'Inter_700Bold',
      fontSize: 24,
      color: colors.cardForeground,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 8,
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    activeDot: {
      backgroundColor: colors.primary,
    },
    inactiveDot: {
      backgroundColor: colors.muted,
    },
  });
