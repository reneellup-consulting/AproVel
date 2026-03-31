import { apiFetch } from '@/utils/api';
import { PurchaseOrder, PurchaseOrderLine } from '@/interfaces/db-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

// --- API Helper ---
interface OrderApiResponse {
  success: boolean;
  order: PurchaseOrder & { $id: string; $createdAt: string };
  lines: (PurchaseOrderLine & { $id: string })[];
  total_amount: number;
}

const fetchOrderById = async (orderId: string): Promise<OrderApiResponse> => {
  const response = await apiFetch(`/api/orders/${orderId}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

const updateOrderFields = async (
  orderId: string,
  fields: Partial<PurchaseOrder>,
) => {
  const response = await apiFetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
  if (!response.ok) throw new Error('Failed to update order');
  return response.json();
};

export const useOrderDetails = (orderId: string) => {
  const queryClient = useQueryClient();

  // --- Query ---
  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId),
    enabled: !!orderId,
    select: (data) => {
      const order = {
        ...data.order,
        id: data.order.$id,
        entry_date: data.order.entry_date || data.order.$createdAt,
      };

      const lines = data.lines.map((line) => ({
        ...line,
        id: line.$id,
      }));

      return {
        ...order,
        order_lines: lines,
        amount: data.total_amount ?? order.amount,
      };
    },
  });

  // --- Derived State ---
  const historyItems = useMemo(() => {
    if (!query.data?.history) return [];
    return query.data.history
      .split(/\s{3,}/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }, [query.data?.history]);

  // --- Mutations ---
  const approveMutation = useMutation({
    mutationFn: () => updateOrderFields(orderId, { status: 'approved' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
      queryClient.invalidateQueries({ queryKey: ['historyOrders'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason?: string) =>
      updateOrderFields(orderId, {
        status: 'rejected',
        rejection_reason: reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['pendingOrders'] });
      queryClient.invalidateQueries({ queryKey: ['historyOrders'] });
    },
  });

  const updateRemarksMutation = useMutation({
    mutationFn: (newRemarks: string) =>
      updateOrderFields(orderId, { remarks: newRemarks } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
  });

  return {
    ...query,
    historyItems,
    approveMutation,
    rejectMutation,
    updateRemarksMutation,
    isProcessing:
      approveMutation.isPending ||
      rejectMutation.isPending ||
      updateRemarksMutation.isPending,
  };
};
