import { VendorStat } from '@/hooks/useHomeData';
import { AppColors } from '@/interfaces/color';
import { formatCompactNumber } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface VendorRowProps {
  vendor: VendorStat;
  isLast: boolean;
  colors: AppColors;
}

export const VendorRow = ({ vendor, isLast, colors }: VendorRowProps) => {
  const isPositive = vendor.percentage_change >= 0;
  const statusColor = isPositive ? colors.green || '#10B981' : colors.red;

  const styles = getStyles(colors);

  return (
    <View style={[styles.vendorRow, !isLast && styles.borderBottom]}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={styles.vendorRowName} numberOfLines={2}>
          {vendor.vendor_name}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={styles.vendorRowAmount}>
          {formatCompactNumber(vendor.total_amount)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons
            name={isPositive ? 'arrow-up' : 'arrow-down'}
            size={12}
            color={statusColor}
          />
          <Text style={[styles.vendorRowPercent, { color: statusColor }]}>
            {Math.abs(vendor.percentage_change)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: AppColors) =>
  StyleSheet.create({
    vendorRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    borderBottom: { borderBottomWidth: 1, borderColor: colors.border },
    vendorRowName: {
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      color: colors.foreground,
    },
    vendorRowAmount: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      color: colors.mutedForeground,
    },
    vendorRowPercent: {
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
      marginLeft: 2,
    },
  });
