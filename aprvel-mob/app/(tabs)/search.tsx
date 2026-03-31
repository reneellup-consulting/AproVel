import { RecommendedCarousel } from '@/components/recommended-carousel';
import { FilterState, OrderFilterSheet } from '@/components/order-filter-sheet';
import { OrderSwipeableRow } from '@/components/order-swipeable-row';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { SearchFilters, useSearchOrders } from '@/hooks/use-search-orders';
import { useRecentOrders } from '@/hooks/use-recent-orders';

import { useRecommendedOrders } from '@/hooks/use-recommended-orders';
import { useAppColors } from '@/hooks/useAppColors';
import { AppColors } from '@/interfaces/color';
import { ProcessedOrder, PurchaseOrder } from '@/interfaces/db-types';
import { ConfirmationSheet } from '@/components/confirmation-sheet';
import { apiFetch } from '@/utils/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

// --- API Functions ---
const rejectOrderApi = async ({
  id,
  reason,
}: {
  id: string;
  reason?: string;
}): Promise<void> => {
  const response = await apiFetch(`/api/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Rejected', rejection_reason: reason }),
  });

  if (!response.ok) throw new Error('Failed to reject order');
};

// --- MAIN SCREEN ---
const SearchScreen = () => {
  const router = useRouter();
  const colors = useAppColors();
  const styles = makeStyles(colors);
  const queryClient = useQueryClient();

  const [query, setQuery] = useState('');
  const [itemToReject, setItemToReject] = useState<PurchaseOrder | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFilterVisible, setFilterVisible] = useState(false);

  const [sheetFilters, setSheetFilters] = useState<FilterState>({
    status: [],
    po_type: [],
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 800);
    return () => clearTimeout(handler);
  }, [query]);

  const activeFilters: SearchFilters = {
    po_type: sheetFilters.po_type?.[0],
    status: sheetFilters.status,
    startDate: sheetFilters.startDate,
    endDate: sheetFilters.endDate,
  };

  /* --- DATA FETCHING --- */
  const isSearching = debouncedQuery.length > 0;

  // 1. Search Hook (Legacy / Page-based)
  const searchResult = useSearchOrders(
    debouncedQuery,
    activeFilters,
    isSearching, // Only enable when searching
  );

  // 2. Recent History Hook (New / Cursor-based)
  const recentResult = useRecentOrders(
    sheetFilters, // Pass filters directly or adapt if needed
    !isSearching, // Only enable when NOT searching
  );

  // Unified State Access
  const {
    data: activeData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = isSearching ? searchResult : recentResult;

  // --- DATA PROCESSING LOGIC ---
  const processedOrders = useMemo(() => {
    if (isSearching) {
      // Search Result: pages are objects { orders: [], nextCursor: ... }
      const rawOrders =
        searchResult.data?.pages.flatMap((page) => page.orders) || [];

      return rawOrders.map((order) => {
        // API ensures order.amount is populated
        return {
          ...order,
          calculatedTotal: order.amount ?? 0,
        } as ProcessedOrder;
      });
    } else {
      // Recent Result: pages are objects { orders: [], nextCursor: ... }
      const rawOrders =
        recentResult.data?.pages.flatMap((page) => page.orders) || [];

      // API already calculates amount or we handle it in hook,
      // but let's ensure consistency if we rely on calculatedTotal in UI
      return rawOrders.map((order) => {
        // If the hook guarantees 'amount', use it.
        // But UI might expect 'calculatedTotal' property specifically if reused.
        // Let's check ProcessedOrder type if possible, or just add both.
        return {
          ...order,
          calculatedTotal: order.amount ?? 0,
        } as ProcessedOrder;
      });
    }
  }, [searchResult.data, recentResult.data, isSearching]);

  // --- FILTER HIGH VALUE ITEMS ---

  const { data: recommendedOrders = [] } = useRecommendedOrders();

  const activeFilterCount =
    (sheetFilters.startDate || sheetFilters.endDate ? 1 : 0) +
    sheetFilters.status.length +
    (sheetFilters.po_type?.length || 0);

  // Mutation
  const rejectMutation = useMutation({
    mutationFn: rejectOrderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchOrders'] });
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
      queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
      setItemToReject(null);
    },
    onError: (err) => {
      alert(`Error: ${err.message}`);
    },
  });

  const renderContent = () => {
    if (isLoading && !isRefetching && processedOrders.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>Unable to load orders</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={processedOrders}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => (
          <OrderSwipeableRow
            item={item}
            onDetails={(id) => router.push(`/order/${id}`)}
            onReject={
              item.status === 'Pending'
                ? (item) => setItemToReject(item)
                : undefined
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View>
            {!isSearching && recommendedOrders.length > 0 && (
              <RecommendedCarousel
                orders={recommendedOrders}
                onPress={(id) => router.push(`/order/${id}`)}
              />
            )}

            <View style={styles.listHeader}>
              {isSearching ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.listTitle}>RESULTS</Text>
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultBadgeText}>
                      {processedOrders.length}
                      {hasNextPage ? '+' : ''}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.listTitle}>Recent History</Text>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons
              name='document-text-outline'
              size={48}
              color={colors.border}
            />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
        keyboardShouldPersistTaps='handled'
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title='Search Orders' enableBackground={false} />

      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons
            name='search'
            size={20}
            color={colors.mutedForeground}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder='Search PO #, vendor name...'
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoCapitalize='none'
            returnKeyType='search'
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons
                name='close-circle'
                size={20}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterTrigger}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name='filter' size={20} color={colors.mutedForeground} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {renderContent()}

      <OrderFilterSheet
        visible={isFilterVisible}
        onClose={() => setFilterVisible(false)}
        onConfirm={(newFilters: FilterState) => {
          setSheetFilters(newFilters);
          setFilterVisible(false);
        }}
        initialFilters={sheetFilters}
        showTypeFilter={true}
      />

      <ConfirmationSheet
        visible={!!itemToReject}
        onClose={() => {
          if (!rejectMutation.isPending) setItemToReject(null);
        }}
        onConfirm={(reason) => {
          if (itemToReject) {
            rejectMutation.mutate({ id: itemToReject.id, reason });
          }
        }}
        title='Reject Order'
        description={`Are you sure you want to reject ${itemToReject?.source_no}? This action cannot be undone.`}
        confirmText='Reject Order'
        confirmVariant='reject'
        isLoading={rejectMutation.isPending}
      />
    </View>
  );
};

export default SearchScreen;

const makeStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 16,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      zIndex: 10,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      height: 48,
      marginRight: 12,
    },
    filterTrigger: { padding: 4, position: 'relative' },
    filterBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.primary,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.background,
    },
    filterBadgeText: {
      color: colors.primaryForeground,
      fontSize: 8,
      fontWeight: 'bold',
    },
    searchIcon: { marginRight: 8 },
    input: {
      flex: 1,
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      color: colors.foreground,
      height: '100%',
    },
    listHeader: { paddingHorizontal: 16, paddingVertical: 12 },
    listTitle: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
      textTransform: 'uppercase',
      // letterSpacing: 0.5,
      color: colors.foreground,
    },
    resultBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginLeft: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    resultBadgeText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
      color: colors.primaryForeground,
    },
    listContent: { paddingBottom: 100, paddingTop: 8 },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 50,
      paddingHorizontal: 20,
    },
    emptyText: {
      fontFamily: 'Inter_500Medium',
      fontSize: 15,
      color: colors.textMuted,
      marginTop: 12,
    },
    errorText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 16,
      color: colors.red,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      marginTop: 16,
    },
    retryButtonText: {
      color: colors.primaryForeground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 14,
    },
  });
