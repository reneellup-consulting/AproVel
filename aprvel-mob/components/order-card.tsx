import { OrderStatus } from '@/components/order-status';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { PurchaseOrder } from '@/interfaces/db-types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface OrderCardProps {
  item: PurchaseOrder;
  onPress: () => void;
  style?: ViewStyle;
}

export const OrderCard = ({ item, onPress, style }: OrderCardProps) => {
  const colors = useAppColors();
  const styles = makeStyles(colors);

  const isFuel = item.po_type === 'Fuel';
  const vectorIcon = isFuel ? 'gas-station' : 'package-variant-closed';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* Vector Background */}
      <View style={styles.vectorContainer}>
        <MaterialCommunityIcons
          name={vectorIcon}
          size={80}
          color={colors.mutedForeground}
          style={{ opacity: 0.08 }}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text numberOfLines={1} style={styles.itemTitle}>
          {item.vendor}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.itemSecondary}>{item.source_no}</Text>
          <View style={styles.dateContainer}>
            <Entypo
              name='calendar'
              size={14}
              color={colors.mutedForeground}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.itemSecondary, styles.dateIcon]}>
              {formatDate(item.entry_date)}
            </Text>
          </View>
        </View>

        <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
      </View>

      <View style={styles.statusContainer}>
        <OrderStatus status={item.status} />
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: colors.accent,
      borderTopWidth: 1,
      borderColor: colors.border,
      position: 'relative',
      overflow: 'hidden',
    },
    vectorContainer: {
      position: 'absolute',
      right: -15,
      bottom: -15,
      zIndex: 0,
      transform: [{ rotate: '-10deg' }],
    },
    contentContainer: {
      padding: 16,
      width: '70%',
    },
    statusContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '30%',
    },
    itemTitle: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      color: colors.cardForeground,
    },
    itemSecondary: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      color: colors.mutedForeground,
    },
    itemAmount: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      color: colors.cardForeground,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 2,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 16,
    },
    dateIcon: {
      marginRight: 4,
    },
  });
