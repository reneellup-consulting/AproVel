import { apiFetch } from '@/utils/api';
import { PurchaseOrder } from '@/interfaces/db-types';
import { QueryKey, useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 100;

// Define a type for our filters
export interface SearchFilters {
  status?: string[];
  po_type?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchSearchOrders = async ({
  pageParam,
  queryKey,
}: {
  pageParam: string | null;
  queryKey: QueryKey;
}): Promise<{ orders: PurchaseOrder[]; nextCursor: string | null }> => {
  // queryKey[1] is the text query, queryKey[2] is the filters object
  const [_, searchQuery, filters] = queryKey as [
    string,
    string,
    SearchFilters | undefined,
  ];

  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
  });

  if (pageParam) {
    params.append('cursor', pageParam);
  }

  // 1. Handle Text Search
  if (searchQuery) {
    params.append('search', searchQuery);
  }

  // 2. Handle Specific Filters
  if (filters) {
    // Status (Array)
    if (filters.status && filters.status.length > 0) {
      filters.status.forEach((s) => params.append('status', s));
    }

    // PO Type
    if (filters.po_type) {
      params.append('po_type', filters.po_type);
    }

    // Date Range
    if (filters.startDate) {
      params.append('from', formatLocalDate(filters.startDate));
    }
    if (filters.endDate) {
      params.append('to', `${formatLocalDate(filters.endDate)}T23:59:59.999`);
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
        // Calculate total amount if not present, though API should provide it
        amount:
          order.amount ??
          order.order_lines?.reduce(
            (sum: number, line: any) => sum + (line.total || 0),
            0,
          ) ??
          0,
      };
    });

    return { orders, nextCursor: data.nextCursor };
  }

  return { orders: [], nextCursor: null };
};

export const useSearchOrders = (
  searchQuery: string,
  filters?: SearchFilters,
  enabled: boolean = true,
) => {
  return useInfiniteQuery({
    queryKey: ['searchOrders', searchQuery, filters],
    queryFn: fetchSearchOrders,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  });
};
