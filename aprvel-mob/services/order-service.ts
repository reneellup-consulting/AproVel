import { apiFetch } from '@/utils/api';
import { PurchaseOrderLine } from '@/interfaces/db-types';

export const updateOrderLine = async (
  _orderId: string | number, // kept for backward compatibility if needed, but unused
  lineId: string | number,
  updates: Partial<PurchaseOrderLine>,
) => {
  const response = await apiFetch(`/api/order-lines/${lineId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.message || 'Failed to update line');
    } catch (e) {
      console.error('API Error (Parse Failed):', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  }

  return response.json();
};
