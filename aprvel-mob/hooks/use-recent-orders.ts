import { FilterState } from '@/components/order-filter-sheet';
import { apiFetch } from '@/utils/api';
import { PurchaseOrder } from '@/interfaces/db-types';
import { QueryKey, useInfiniteQuery } from '@tanstack/react-query';

export const PAGE_SIZE = 15;

// Type defining the structure of our QueryKey
type RecentQueryKey = [string, FilterState | undefined];

// Formats date to YYYY-MM-DD in LOCAL time
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchRecentOrders = async ({
  pageParam,
  queryKey,
}: {
  pageParam: string | null;
  queryKey: QueryKey;
}): Promise<{ orders: PurchaseOrder[]; nextCursor: string | null }> => {
  // Safe cast of the query key
  const [_, filters] = queryKey as RecentQueryKey;

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
    }
    // Note: Unlike history, we don't filter out pending/etc by default unless requested.
    // However, if the requirement is "Recent History", maybe we SHOULD match history logic?
    // The user request says "Recent History list", implying it should show what history shows but properly connected.
    // But usually "Recent" in search screen might mean "Recent orders I interacted with" or just "All recent orders".
    // I'll stick to "All recent orders" (no default status filter) per my plan, as search usually searches everything.

    // PO Type
    if (filters.po_type && filters.po_type.length > 0) {
      // use-search-orders treats po_type as string, but filter state has it as string[] usually in other places?
      // Let's look at SearchFilters in search.tsx.
      // In search.tsx: po_type: sheetFilters.po_type?.[0]
      // So it passes a string.
      // Wait, the FilterState in search.tsx has po_type: string[].
      // In search.tsx, activeFilters.po_type is string.
      // In use-history-orders, it expects activeTab which is string.

      // I will align with FilterState from order-filter-sheet which likely has po_type as string[].
      // But the input 'filters' here will come from search.tsx which constructs a specific object.
      // Let's see search.tsx again.
      // activeFilters is of type SearchFilters currently defined in use-search-orders.ts.
      // I should probably reuse that type or define a compatible one.
      // For now, I'll assume filters matches what search.tsx produces.

      // Actually, I'll just check if it's a string or array to be safe if I reuse types.
      if (Array.isArray(filters.po_type)) {
        filters.po_type.forEach((t) => params.append('po_type', t));
      } else if (typeof filters.po_type === 'string') {
        params.append('po_type', filters.po_type);
      }
    }
  }

  const response = await apiFetch(`/api/orders?${params.toString()}`);
  if (!response.ok) throw new Error('Network response was not ok');

  const data = await response.json();

  if (data.success && Array.isArray(data.orders)) {
    const orders = data.orders.map((order: any): PurchaseOrder => {
      return {
        ...order,
        id: order.$id, // Map Appwrite ID
        amount: order.amount ?? 0,
      };
    });

    return { orders, nextCursor: data.nextCursor };
  }

  return { orders: [], nextCursor: null };
};

export const useRecentOrders = (
  filters?: FilterState, // We'll need to align types
  enabled: boolean = true,
) => {
  return useInfiniteQuery({
    queryKey: ['recentOrders', filters],
    queryFn: fetchRecentOrders,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });
};
