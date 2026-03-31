import { ProcessedOrder } from '@/interfaces/db-types';
import { apiFetch } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

const fetchRecommendedOrders = async (): Promise<ProcessedOrder[]> => {
  const response = await apiFetch('/api/orders/recommendations');

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  const orders = data.orders || [];

  return orders.map((order: any) => {
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
};

export const useRecommendedOrders = () => {
  return useQuery({
    queryKey: ['recommendedOrders'],
    queryFn: fetchRecommendedOrders,
  });
};
