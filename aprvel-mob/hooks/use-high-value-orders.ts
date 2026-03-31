import { now } from '@/constants';
import { ProcessedOrder, PurchaseOrder } from '@/interfaces/db-types';
import { apiFetch } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

const fetchHighValueOrders = async (): Promise<ProcessedOrder[]> => {
  // Fetch recent orders.
  // We fetch slightly more to filter for high value locally if needed.
  // Using '/api/orders' to match pattern in other hooks (leading slash).
  const response = await apiFetch(
    '/api/orders?status=Pending&_sort=entry_date&_order=desc&_limit=100',
  );

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data: any = await response.json();

  // Use 'orders' array if wrapped in success object (like useHistoryOrders), otherwise assume data is array
  // Adjust based on API response structure seen in useHistoryOrders (data.orders)
  // However, useHighValueOrders simple fetch might return array directly if not using the wrapper?
  // Let's assume the previous code 'data: PurchaseOrder[] = await response.json()' implies it was an array.
  // BUT useHistoryOrders shows `data.orders`.
  // Let's handle both just in case, or stick to previous assumption if unsure.
  // Actually, useHistoryOrders uses `/api/orders` and gets `{ success: true, orders: [...] }`.
  // So we MUST handle that structure if we are hitting the same endpoint.

  const orders = Array.isArray(data) ? data : data.orders || [];

  const processed = orders.map((order: any) => {
    // robust total calculation
    const totalAmount =
      order.order_lines?.reduce(
        (sum: number, line: any) => sum + (line.total || 0),
        0,
      ) ||
      order.amount ||
      0;

    return { ...order, calculatedTotal: totalAmount } as ProcessedOrder;
  });

  // Filter:
  // 1. High Value (> 1000)
  // 2. Removed 'date <= now' check as it blocks recent items (future/current dates).
  const filtered = processed.filter((order: any) => {
    // If we really need a date check, we can add it back, but "Recent" implies we want the latest.
    return order.calculatedTotal > 1000;
  });

  // Take top 5
  return filtered.slice(0, 10);
};

export const useHighValueOrders = () => {
  return useQuery({
    queryKey: ['highValueOrders'],
    queryFn: fetchHighValueOrders,
  });
};
