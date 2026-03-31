import { ConfirmationSheet } from '@/components/confirmation-sheet';
import { OrderSwipeableRow } from '@/components/order-swipeable-row';
import { ScreenHeader } from '@/components/screen-header';
import { TabHeader } from '@/components/tab-header';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useAppColors } from '@/hooks/useAppColors';
import { apiFetch } from '@/utils/api';
import { AppColors } from '@/interfaces/color';
import { PurchaseOrder } from '@/interfaces/db-types';
import { groupOrdersByDate } from '@/utils/date-helpers';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// --- API Functions ---
const fetchPendingOrders = async ({
  pageParam,
}: {
  pageParam: string | null;
}): Promise<{ orders: PurchaseOrder[]; nextCursor: string | null }> => {
  const params = new URLSearchParams({
    status: 'Pending',
    limit: '100', // Load 20 items per page
  });

  if (pageParam) {
    params.append('cursor', pageParam);
  }

  const response = await apiFetch(`/api/orders?${params.toString()}`);
  if (!response.ok) throw new Error('Network response was not ok');

  const data = await response.json();
  if (data.success && Array.isArray(data.orders)) {
    // Map Appwrite $id to id
    const orders = data.orders.map((order: any) => ({
      ...order,
      id: order.$id,
    }));
    return { orders, nextCursor: data.nextCursor };
  }
  throw new Error('Invalid API response structure');
};

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

export default function PendingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = useAppColors();
  const styles = makeStyles(colors);

  // State
  const [itemToReject, setItemToReject] = useState<PurchaseOrder | null>(null);
  const [activeTab, setActiveTab] = useState('All');

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'General', label: 'Items' },
    { id: 'Fuel', label: 'Fuel POs' },
  ];

  // --- Query ---
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['pendingOrders', 'list'],
    queryFn: fetchPendingOrders,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? null,
    initialPageParam: null as string | null,
  });

  // Flatten pages
  const allOrders = useMemo(() => {
    if (!data) return [];
    // Sort logic moved here from select
    return data.pages
      .flatMap((page) => page.orders)
      .sort(
        (a, b) =>
          new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime(),
      );
  }, [data]);

  // --- Helpers ---
  const getTabCount = (tabId: string) => {
    if (!data) return 0;
    if (tabId === 'All') return allOrders.length;
    return allOrders.filter((item) => item.po_type === tabId).length;
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return allOrders.filter((item) => {
      if (activeTab === 'All') return true;
      return item.po_type === activeTab;
    });
  }, [allOrders, activeTab]);

  // Group Data
  const groupedData = useMemo(() => {
    if (!filteredData) return [];
    return groupOrdersByDate(filteredData);
  }, [filteredData]);

  // Mutation
  const rejectMutation = useMutation({
    mutationFn: rejectOrderApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingOrders', 'list'] });
      setItemToReject(null);
    },
    onError: (err) => {
      alert(`Error: ${err.message}`);
    },
  });

  const renderContent = () => {
    if (isLoading && !data) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.errorText}>Error fetching orders</Text>
          <Text style={styles.errorSubText}>{error.message}</Text>
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
      <SectionList
        sections={groupedData}
        keyExtractor={(item) => item.id || String(item.ref_id)}
        renderItem={({ item, index, section }) => (
          <OrderSwipeableRow
            item={item}
            isLastInSection={index === section.data.length - 1}
            onReject={(item) => setItemToReject(item)}
            onDetails={(id) => router.push(`../order/${id}`)}
          />
        )}
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>{data.length}</Text>
            </View>
          </View>
        )}
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
          <Text style={styles.emptyText}>
            {activeTab === 'All'
              ? 'No pending orders found.'
              : `No pending ${activeTab.toLowerCase()} orders found.`}
          </Text>
        }
        stickySectionHeadersEnabled={false}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ padding: 20 }}>
              <ActivityIndicator size='small' color={colors.primary} />
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title='Pending Orders' enableBackground={false} />

      {/* Reusable Tab Header */}
      <TabHeader
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        getBadgeCount={getTabCount}
      />

      {renderContent()}

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
      paddingTop: 50,
    },
    listContent: {
      paddingBottom: 100,
    },

    // --- Section Header Styles ---
    sectionHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 8,
    },
    sectionHeaderText: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionBadge: {
      marginLeft: 8,
      backgroundColor: colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
      minWidth: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionBadgeText: {
      fontSize: 10,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
    },
    // --- Empty/Error States ---
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
  });
