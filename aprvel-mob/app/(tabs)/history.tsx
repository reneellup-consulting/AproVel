import { FilterState, OrderFilterSheet } from '@/components/order-filter-sheet';
import { ScreenHeader } from '@/components/screen-header';
import { TabHeader } from '@/components/tab-header';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { PurchaseOrder } from '@/interfaces/db-types';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// --- Interfaces ---

const initialFilterState: FilterState = {
  startDate: null,
  endDate: null,
  status: [],
};

import { OrderSwipeableRow } from '@/components/order-swipeable-row';
import { useHistoryOrders } from '@/hooks/use-history-orders';

// --- Swipeable Component ---

// --- Main Screen ---

export default function HistoryScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const styles = makeStyles(colors);

  // Refs
  const flatListRef = useRef<FlatList<PurchaseOrder>>(null);

  // State
  const [activeTab, setActiveTab] = useState('All');
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(initialFilterState);

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'General', label: 'Items' },
    { id: 'Fuel', label: 'Fuel POs' },
  ];

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useHistoryOrders(activeTab, appliedFilters);

  const orders = data?.pages.flatMap((page) => page.orders) || [];

  const activeFilterCount =
    (appliedFilters.startDate || appliedFilters.endDate ? 1 : 0) +
    appliedFilters.status.length;

  // --- Effects ---

  // Scroll to top when tab or filters change to avoid bad UX
  useEffect(() => {
    if (orders.length > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }
  }, [activeTab, appliedFilters]);

  // --- Render Helpers ---

  const renderContent = () => {
    if (isLoading && !isRefetching) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>Error fetching history</Text>
          <Text style={styles.errorSubText}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        ref={flatListRef}
        data={orders}
        // Use ID for unique keying, fallback to index only if ID is missing
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <OrderSwipeableRow
            item={item}
            onDetails={(id) => router.push(`../order/${id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
            tintColor={colors.primary}
          />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loaderFooter}>
              <ActivityIndicator size='small' color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'All'
              ? 'No history found.'
              : `No ${activeTab.toLowerCase()} history found.`}
          </Text>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title='History' enableBackground={false} />

      {/* Filter Trigger Bar */}
      <View style={styles.filterBar}>
        <TabHeader
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showFilter
          onFilterPress={() => setFilterVisible(true)}
          filterCount={activeFilterCount}
        />
      </View>

      {renderContent()}

      <OrderFilterSheet
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
        onConfirm={(filters: FilterState) => {
          setAppliedFilters(filters);
          setFilterVisible(false);
        }}
        initialFilters={appliedFilters}
        hiddenStatuses={['Pending']}
      />
    </View>
  );
}

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center', // Centered vertically as well
      paddingBottom: 50,
    },
    listContent: {
      paddingBottom: 100,
      paddingTop: 8,
    },
    loaderFooter: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    errorText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 16,
      color: colors.red,
    },
    errorSubText: {
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      marginTop: 8,
      color: colors.textMuted,
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.primaryForeground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
    },
    emptyText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 20,
      color: colors.secondaryForeground,
    },
    filterBar: {
      zIndex: 1,
    },
  });
