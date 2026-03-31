import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Hooks & Components
import { LineChart } from '@/components/charts/line-chart';
import { PendingCarousel } from '@/components/dashboard/pending-carousel';
import { VendorRow } from '@/components/dashboard/vendor-row';
import { ScreenHeader } from '@/components/screen-header';
import { useAppColors } from '@/hooks/useAppColors';
import { useHomeData } from '@/hooks/useHomeData';
import { AppColors } from '@/interfaces/color';
import { formatCompactNumber, formatCycleTime } from '@/utils/formatters';

const HomeScreen = () => {
  const router = useRouter();
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const styles = getScreenStyles(colors);

  const {
    isLoading,
    isError,
    orders,
    topVendors,
    chartData,
    refetchAll,
    approvalCycle,
    spendingTotal,
    spendingTrend,
  } = useHomeData();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Unable to load dashboard data</Text>
        <Text
          onPress={refetchAll}
          style={{ marginTop: 10, color: colors.primary }}
        >
          Tap to Retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title='Home' enableBackground={false} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 100 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetchAll}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
            tintColor={colors.primary}
          />
        }
      >
        {/* Pending Orders Section */}
        <PendingCarousel
          orders={orders}
          onPressOrder={(id) => router.push(`/order/${id}`)}
          onSeeAll={() => router.push('/pending')}
        />

        <Text style={styles.sectionTitle}>Key Metrics</Text>

        {/* Metric 1: Cycle Time */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Approval Cycle Time</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricValue}>
              {formatCycleTime(approvalCycle.averageHours)}
            </Text>
            {approvalCycle.trendPercentage !== 0 && (
              <View
                style={[
                  styles.trendBadge,
                  {
                    backgroundColor: colors.accent,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather
                  name={
                    approvalCycle.trendDirection === 'up'
                      ? 'arrow-down-right'
                      : 'arrow-up-right'
                  }
                  size={12}
                  color={
                    approvalCycle.trendDirection === 'down'
                      ? colors.green
                      : colors.red
                  }
                />
                <Text
                  style={[styles.trendText, { color: colors.mutedForeground }]}
                >
                  {approvalCycle.trendPercentage}%{' '}
                  {approvalCycle.trendDirection === 'down'
                    ? 'faster'
                    : 'slower'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Metric 2: Spending Chart */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Spending Trend (Last 6 Months)</Text>
          <View style={[styles.metricRow, { alignItems: 'baseline' }]}>
            <Text style={styles.metricValue}>
              {formatCompactNumber(spendingTotal, 'Php')}
            </Text>
            {spendingTrend.percentage !== 0 && (
              <View style={styles.trend}>
                <Ionicons
                  name={
                    spendingTrend.direction === 'up'
                      ? 'trending-up'
                      : 'trending-down'
                  }
                  size={16}
                  color={
                    spendingTrend.direction === 'up' ? colors.green : colors.red
                  }
                />
                <Text
                  style={[
                    styles.trendText,
                    {
                      color:
                        spendingTrend.direction === 'up'
                          ? colors.green
                          : colors.red,
                    },
                  ]}
                >
                  {spendingTrend.percentage}%
                </Text>
              </View>
            )}
          </View>

          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              config={{
                height: 160,
                showHorizontalGrid: true,
                showVerticalGrid: false,
                bottomPaddingRatio: 0.2,
                paddingBottom: 25,
                showYLabels: true,
                yAxisWidth: 35,
                showLabels: true,
                gradient: true,
                animated: true,
                interactive: true,
                padding: 10,
              }}
            />
          </View>
        </View>

        {/* Top Vendors Section */}
        <Text style={styles.sectionTitle}>
          Top 5 Vendors by Spending (This Month)
        </Text>
        <View style={styles.listContainer}>
          {topVendors.map((vendor, index) => (
            <VendorRow
              key={vendor.vendor_name}
              vendor={vendor}
              isLast={index === topVendors.length - 1}
              colors={colors}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

// --- Screen Styles ---
const getScreenStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContainer: { paddingBottom: 40 },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    errorText: { fontFamily: 'Inter_500Medium', color: colors.red },
    sectionTitle: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      color: colors.foreground,
      paddingHorizontal: 16,
      marginBottom: 12,
      marginTop: 8,
    },
    metricCard: {
      backgroundColor: colors.accent,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metricLabel: {
      fontFamily: 'Inter_SemiBold',
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    metricRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    metricValue: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 30,
      color: colors.cardForeground,
    },
    trend: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      gap: 4,
    },
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      borderWidth: 1,
      gap: 4,
    },
    trendText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
    chartContainer: { height: 160, marginTop: 16, marginLeft: -10 },
    listContainer: {
      backgroundColor: colors.accent,
      marginHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
  });
