import { AppColors } from '@/interfaces/color';
import { PurchaseOrderLine } from '@/interfaces/db-types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LineDetailsSectionProps {
  line: PurchaseOrderLine;
  colors: AppColors;
}

export const LineDetailsSection = ({
  line,
  colors,
}: LineDetailsSectionProps) => {
  const styles = makeStyles(colors);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Other Details</Text>
      <View style={styles.detailsList}>
        <DetailItem
          label='Requisition No.'
          value={line.requisition_no}
          styles={styles}
        />
        <DetailItem
          label='Discount'
          value={line.discount?.toFixed(2) || '0.00'}
          styles={styles}
        />
        <DetailItem
          label='Remaining Qty'
          value={`${line.remaining_qty?.toFixed(2) || '0.00'} ${
            line.unit_of_measure
          }`}
          styles={styles}
        />
        <DetailItem
          label='Received'
          value={line.quantity?.toFixed(2)}
          styles={styles}
        />
        {!!line.origin && (
          <DetailItem label='Origin' value={line.origin} styles={styles} />
        )}
        {!!line.destination && (
          <DetailItem
            label='Destination'
            value={line.destination}
            styles={styles}
          />
        )}
        {!!line.tad && (
          <DetailItem label='TAD' value={`${line.tad} km`} styles={styles} />
        )}
      </View>
    </View>
  );
};

const DetailItem = ({ label, value, styles }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode='tail'>
      {value || '-'}
    </Text>
  </View>
);

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    section: {
      gap: 8,
    },
    sectionLabel: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    detailsList: { gap: 8 },
    detailRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    detailLabel: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      marginRight: 4,
    },
    detailValue: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      flex: 1,
    },
  });
