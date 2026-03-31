import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { PurchaseOrderLine } from '@/interfaces/db-types';
import { updateOrderLine } from '@/services/order-service';
import { formatCurrency } from '@/utils/formatters';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface LeftActionProps {
  dragX: SharedValue<number>;
  isReleased: boolean;
  colors: AppColors;
}

const LeftAction = ({ dragX, isReleased, colors }: LeftActionProps) => {
  const actionColor = isReleased ? colors.primary : '#17B26A';
  const actionText = isReleased ? 'Hold Item' : 'Release Item';

  const textStyle = useAnimatedStyle(() => {
    const trans = interpolate(
      dragX.value,
      [0, 50, 100],
      [-20, 0, 0],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX: trans }],
    };
  });

  return (
    <View
      style={{
        backgroundColor: actionColor,
        justifyContent: 'center',
        alignItems: 'flex-start',
        flex: 1,
        paddingLeft: 20,
      }}
    >
      <Reanimated.Text
        style={[
          {
            color: 'white',
            fontWeight: 'bold',
            fontFamily: 'Inter_600SemiBold',
            fontSize: 13,
          },
          textStyle,
        ]}
      >
        {actionText}
      </Reanimated.Text>
    </View>
  );
};

export const OrderLineItem = ({
  line,
  orderId,
  isLast,
  onPress,
  readOnly,
}: {
  line: PurchaseOrderLine;
  orderId: string | number;
  isLast?: boolean;
  onPress: () => void;
  readOnly?: boolean;
}) => {
  const colors = useAppColors();
  const styles = makeStyles(colors);
  const queryClient = useQueryClient();
  const swipeableRef = useRef<any>(null);

  const isReleased = line.line_status === 'Released';
  const statusColor = isReleased ? colors.primary : colors.border;

  const mutation = useMutation({
    mutationFn: () => {
      if (!line.id) throw new Error('Line ID missing');
      const newStatus = isReleased ? 'Hold' : 'Released';
      // orderId is not strictly needed for the new service impl, but we keep it
      // to match the function signature unless we decide to change it universally.
      // Based on my previous edit to order-service.ts, I kept the signature compatible.
      return updateOrderLine(orderId, line.id, { line_status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order'] });
      swipeableRef.current?.close();
    },
    onError: (err) => {
      swipeableRef.current?.close();
      Alert.alert('Error', 'Failed to update line status.');
      console.error(err);
    },
  });

  const renderLeftActions = (
    progress: SharedValue<number>,
    dragX: SharedValue<number>,
  ) => {
    // Return empty view if readOnly to prevent swipe actions from showing
    if (readOnly) return <View style={{ width: 0 }} />;
    return <LeftAction dragX={dragX} isReleased={isReleased} colors={colors} />;
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      onSwipeableOpen={() => !readOnly && mutation.mutate()}
      friction={1.5}
      overshootFriction={8}
      leftThreshold={80}
      enableTrackpadTwoFingerGesture
      enabled={!readOnly}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.lineItemContainer,
          isLast && { borderBottomWidth: 1 },
          pressed && { backgroundColor: colors.background }, // Subtle feedback
        ]}
      >
        <View
          style={[styles.lineItemBar, { backgroundColor: colors.border }]}
        />
        <View style={styles.lineItemContent}>
          <Text style={styles.lineHeader}>
            {line.code_no ? `${line.code_no} \u2192 ` : ''}
            {line.item}
          </Text>

          <Text style={styles.lineSubText}>
            RQB:{' '}
            <Text style={styles.lineSubValue}>{line.requestor || 'N/A'}</Text>
            {'  '}
            CT:{' '}
            <Text style={styles.lineSubValue}>{line.charge_to || 'N/A'}</Text>
          </Text>

          <View style={styles.lineStatsRow}>
            <Text style={styles.lineSubText}>
              QTY: {line.quantity?.toFixed(2)} {line.unit_of_measure}
            </Text>
            <Text style={styles.lineSubText}>
              Unit Cost: {formatCurrency(line.unit_cost).replace('Php', '')}
            </Text>
          </View>

          <View style={styles.lineFooterRow}>
            <Text style={styles.lineTotal}>{formatCurrency(line.total)}</Text>
            <View style={styles.lineFooterRight}>
              <View style={[styles.statusBadge, { borderColor: statusColor }]}>
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                  {line.line_status || 'Pending'}
                </Text>
              </View>

              {line.reason && (
                <Text style={styles.lineReason} numberOfLines={1}>
                  {line.reason.toUpperCase()}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    lineItemContainer: {
      flexDirection: 'row',
      backgroundColor: colors.accent || '#FFFFFF',
      borderTopWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    lineItemBar: {
      width: 9,
      backgroundColor: colors.mutedForeground,
    },
    lineItemContent: {
      flex: 1,
      padding: 10,
      gap: 4,
    },
    lineHeader: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      color: colors.foreground,
    },
    lineSubText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      color: colors.mutedForeground,
    },
    lineSubValue: {
      color: colors.foreground,
    },
    lineStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    lineFooterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
    },
    lineFooterRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      maxWidth: '65%',
      justifyContent: 'flex-end',
    },
    lineTotal: {
      fontFamily: 'Inter_700Bold',
      fontSize: 15,
      color: colors.foreground,
    },
    statusBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
      backgroundColor: 'transparent',
    },
    statusBadgeText: {
      fontSize: 10,
      fontFamily: 'Inter_600SemiBold',
      textTransform: 'uppercase',
    },
    lineReason: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      flexShrink: 1,
    },
  });
