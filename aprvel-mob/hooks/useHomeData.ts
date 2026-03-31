import { baseUrl } from '@/constants';
import { PurchaseOrder } from '@/interfaces/db-types';
import { apiFetch } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// --- Types ---
export interface MetricItem {
  month: string;
  amount: number;
}

export interface VendorStat {
  vendor_name: string;
  total_amount: number;
  percentage_change: number;
}

export interface ApprovalCycleMetric {
  averageHours: number;
  trendPercentage: number;
  trendDirection: 'up' | 'down' | 'flat';
  count: number;
}

// --- Fetchers ---

const fetchPendingOrders = async (): Promise<PurchaseOrder[]> => {
  const res = await apiFetch('/api/orders?status=Pending');
  if (!res.ok) throw new Error('Failed to fetch orders');

  const data = await res.json();
  if (data.success && Array.isArray(data.orders)) {
    return data.orders.map((order: any) => ({
      ...order,
      id: order.$id || order.id,
    }));
  }

  // Fallback if structure is different or just an array
  if (Array.isArray(data)) return data;

  return [];
};

const fetchMetrics = async () => {
  const res = await apiFetch('/api/metrics/spending');
  if (!res.ok) throw new Error('Failed to fetch spending metrics');
  return res.json();
};

const fetchStats = async (): Promise<VendorStat[]> => {
  const res = await apiFetch('/api/metrics/top-vendors');
  if (!res.ok) throw new Error('Failed to fetch top vendors');
  return res.json();
};

const fetchApprovalCycle = async (): Promise<ApprovalCycleMetric> => {
  const res = await apiFetch('/api/metrics/approval-cycle');
  if (!res.ok) {
    return {
      averageHours: 0,
      trendPercentage: 0,
      trendDirection: 'flat',
      count: 0,
    };
  }
  return res.json();
};

export const useHomeData = () => {
  const ordersQuery = useQuery({
    queryKey: ['pendingOrders'],
    queryFn: fetchPendingOrders,
  });
  const metricsQuery = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
  });
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: fetchStats });
  const approvalCycleQuery = useQuery({
    queryKey: ['approvalCycle'],
    queryFn: fetchApprovalCycle,
  });

  const isLoading =
    ordersQuery.isLoading ||
    metricsQuery.isLoading ||
    statsQuery.isLoading ||
    approvalCycleQuery.isLoading;
  const isError =
    ordersQuery.isError ||
    metricsQuery.isError ||
    statsQuery.isError ||
    approvalCycleQuery.isError;

  const refetchAll = () => {
    ordersQuery.refetch();
    metricsQuery.refetch();
    statsQuery.refetch();
    approvalCycleQuery.refetch();
  };

  // Memoize top 5 stats
  const topVendors = useMemo(
    () => (statsQuery.data || []).slice(0, 5),
    [statsQuery.data],
  );

  // Transform Chart Data
  const chartData = useMemo(() => {
    // metricsQuery.data is now our updated response: { success, monthlyData, currentMonthTotal, ... }
    const rawMetrics = metricsQuery.data?.monthlyData || [];

    // Sort oldest to newest for the chart
    const sortedMetrics = [...rawMetrics].sort((a, b) =>
      a.month.localeCompare(b.month),
    );

    return sortedMetrics.map((d: any) => {
      let dateStr = d.month;
      if (/^\d{4}-\d{2}$/.test(dateStr)) dateStr += '-01'; // Handle YYYY-MM
      const date = new Date(dateStr);
      const isValidDate = !isNaN(date.getTime());

      return {
        x: d.month,
        y: d.amount,
        label: isValidDate
          ? date.toLocaleDateString('en-US', { month: 'short' })
          : d.month.substring(0, 3),
      };
    });
  }, [metricsQuery.data]);

  return {
    isLoading,
    isError,
    orders: ordersQuery.data || [],
    metrics: metricsQuery.data?.monthlyData || [],
    spendingTotal: metricsQuery.data?.currentMonthTotal || 0,
    spendingTrend: {
      percentage: metricsQuery.data?.trendPercentage || 0,
      direction: metricsQuery.data?.trendDirection || 'flat',
    },
    topVendors,
    chartData,
    refetchAll,
    approvalCycle: approvalCycleQuery.data || {
      averageHours: 0,
      trendPercentage: 0,
      trendDirection: 'flat',
      count: 0,
    },
  };
};
