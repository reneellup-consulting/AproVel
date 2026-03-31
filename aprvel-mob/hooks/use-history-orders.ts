import { FilterState } from '@/components/order-filter-sheet';
import { apiFetch } from '@/utils/api';
import { PurchaseOrder } from '@/interfaces/db-types';
import { QueryKey, useInfiniteQuery } from '@tanstack/react-query';

export const PAGE_SIZE = 100;

// Type defining the structure of our QueryKey
type HistoryQueryKey = [string, string, FilterState | undefined];

// Formats date to YYYY-MM-DD in LOCAL time
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchHistoryOrders = async ({
  pageParam,
  queryKey,
}: {
  pageParam: string | null;
  queryKey: QueryKey;
}): Promise<{ orders: PurchaseOrder[]; nextCursor: string | null }> => {
  // Safe cast of the query key
  const [_, activeTab, filters] = queryKey as HistoryQueryKey;

  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
  });

  if (pageParam) {
    params.append('cursor', pageParam);
  }

  // Apply Filters
  if (filters) {
    // Date Range
    if (filters.startDate) {
      params.append('from', formatLocalDate(filters.startDate));
    }
    if (filters.endDate) {
      params.append('to', `${formatLocalDate(filters.endDate)}T23:59:59.999`);
    }

    // Status
    if (filters.status.length > 0) {
      filters.status.forEach((s) => params.append('status', s));
    } else {
      // Default to all excluding Pending
      ['Approved', 'Rejected', 'Received', 'Partially Received'].forEach((s) =>
        params.append('status', s),
      );
    }
  } else {
    // Default filter if no explicit filters (excluding Pending)
    ['Approved', 'Rejected', 'Received', 'Partially Received'].forEach((s) =>
      params.append('status', s),
    );
  }

  // Tab Logic
  if (activeTab !== 'All') {
    params.append('po_type', activeTab);
  }

  const response = await apiFetch(`/api/orders?${params.toString()}`);
  if (!response.ok) throw new Error('Network response was not ok');

  const data = await response.json();

  if (data.success && Array.isArray(data.orders)) {
    const orders = data.orders.map((order: any): PurchaseOrder => {
      // Ensure numeric amount calculation if necessary, though API typically handles this.
      // Keeping consistent with previous logic just in case, but usually backend handles totals.
      // If backend returns 'order_lines', we can recalcluate, OR rely on 'amount'.
      // For now, mapping $id to id is crucial.
      return {
        ...order,
        id: order.$id, // Map Appwrite ID
        // Ensure amount is defined
        amount: order.amount ?? 0,
      };
    });

    return { orders, nextCursor: data.nextCursor };
  }

  return { orders: [], nextCursor: null };
};

export const useHistoryOrders = (
  activeTab: string,
  appliedFilters: FilterState,
) => {
  return useInfiniteQuery({
    queryKey: ['historyOrders', activeTab, appliedFilters],
    queryFn: fetchHistoryOrders,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
