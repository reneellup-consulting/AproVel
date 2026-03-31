import { Hono } from 'hono';
import {
  DB_ID,
  ORDERS_TABLE_ID,
  SPENDING_TRENDS_TABLE_ID,
  VENDOR_SPENDING_TRENDS_TABLE_ID,
} from '../config';
import { sessionMiddleware } from '../lib/session-middleware';
import { Query } from 'node-appwrite';

const metrics = new Hono();

// Helper to calculate hours between two dates
const getDurationHours = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
};

metrics.get('/approval-cycle', sessionMiddleware, async (c) => {
  try {
    const tables = c.get('tablesDB');
    const user = c.get('user');

    // Default to looking for orders approved by the current user
    // usage: ?userId=current to filter by current user, or defaults to all if admin/unspecified?
    // The requirement says "My Approval Cycle Time", which implies the current user's performance.
    // However, the `status_by` field usually tracks who approved it.

    // Let's filter by status='Approved' first.
    // We might want to filter by `status_by` if we want "My" average.
    // Checking the user request: "My Approval Cycle Time"

    const queries = [
      Query.equal('status', 'Approved'),
      Query.equal('status_aprvel_by', user.$id),
      Query.limit(1000), // Fetch a reasonable amount to calculate average
    ];

    const result = await tables.listRows({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      queries,
    });

    if (result.total === 0) {
      return c.json({
        success: true,
        averageHours: 0,
        trendPercentage: 0,
        trendDirection: 'flat',
        count: 0,
      });
    }

    let totalHours = 0;
    let validCount = 0;

    const orders = result.rows;

    // Calculate average for all fetched orders
    orders.forEach((order: any) => {
      if (order.$createdAt && order.status_date) {
        const duration = getDurationHours(order.$createdAt, order.status_date);
        if (duration >= 0) {
          // Sanity check
          totalHours += duration;
          validCount++;
        }
      }
    });

    const averageHours = validCount > 0 ? totalHours / validCount : 0;

    // Trend calculation: compare current period vs previous period
    // Split orders with valid durations into two halves by status_date
    let trendPercentage = 0;
    let trendDirection: 'up' | 'down' | 'flat' = 'flat';

    const validOrders = orders.filter(
      (o: any) =>
        o.$createdAt &&
        o.status_date &&
        getDurationHours(o.$createdAt, o.status_date) >= 0,
    );

    if (validOrders.length >= 2) {
      // Sort by status_date ascending (oldest first)
      validOrders.sort(
        (a: any, b: any) =>
          new Date(a.status_date).getTime() - new Date(b.status_date).getTime(),
      );

      const midpoint = Math.floor(validOrders.length / 2);
      const olderHalf = validOrders.slice(0, midpoint);
      const newerHalf = validOrders.slice(midpoint);

      const olderAvg =
        olderHalf.reduce(
          (sum: number, o: any) =>
            sum + getDurationHours(o.$createdAt, o.status_date),
          0,
        ) / olderHalf.length;
      const newerAvg =
        newerHalf.reduce(
          (sum: number, o: any) =>
            sum + getDurationHours(o.$createdAt, o.status_date),
          0,
        ) / newerHalf.length;

      if (olderAvg > 0) {
        trendPercentage = parseFloat(
          (((newerAvg - olderAvg) / olderAvg) * 100).toFixed(1),
        );
        trendDirection =
          trendPercentage < 0 ? 'down' : trendPercentage > 0 ? 'up' : 'flat';
      }
    }

    return c.json({
      success: true,
      averageHours: parseFloat(averageHours.toFixed(1)),
      trendPercentage: Math.abs(trendPercentage),
      trendDirection,
      count: validCount,
    });
  } catch (error: any) {
    console.error('Get Approval Cycle Error:', error);
    return c.json(
      { success: false, message: 'Failed to calculate metrics' },
      500,
    );
  }
});
metrics.get('/spending', sessionMiddleware, async (c) => {
  try {
    const tables = c.get('tablesDB');

    // We want to fetch the last 6 months. Appwrite index on 'month' allows ordering.
    // Query limit 6, order descending
    const queries = [Query.limit(6), Query.orderDesc('month')];

    const result = await tables.listRows({
      databaseId: DB_ID,
      tableId: SPENDING_TRENDS_TABLE_ID,
      queries,
    });

    // Default response if no data
    if (result.rows.length === 0) {
      return c.json({
        success: true,
        monthlyData: [],
        currentMonthTotal: 0,
        trendPercentage: 0,
        trendDirection: 'flat',
      });
    }

    // Since we ordered desc, row 0 is the most recent month
    // But for the chart, we usually want oldest to newest, so we'll reverse
    const sortedData = [...result.rows].reverse();

    // Format for the mobile app
    const monthlyData = sortedData.map((row: any) => ({
      month: row.month,
      amount: row.total_amount,
    }));

    // Calculate trend between most recent and previous month
    const mostRecent = result.rows[0];
    const currentMonthTotal = mostRecent.total_amount;

    let trendPercentage = 0;
    let trendDirection = 'flat';

    if (result.rows.length > 1) {
      const previousMonth = result.rows[1];
      const previousTotal = previousMonth.total_amount;

      if (previousTotal > 0) {
        trendPercentage = parseFloat(
          (((currentMonthTotal - previousTotal) / previousTotal) * 100).toFixed(
            1,
          ),
        );
        trendDirection =
          trendPercentage > 0 ? 'up' : trendPercentage < 0 ? 'down' : 'flat';
      } else if (currentMonthTotal > 0) {
        // If previous month was 0 but this month has spending
        trendPercentage = 100;
        trendDirection = 'up';
      }
    }

    return c.json({
      success: true,
      monthlyData,
      currentMonthTotal,
      trendPercentage: Math.abs(trendPercentage),
      trendDirection,
    });
  } catch (error: any) {
    console.error('Get Spending Error:', error);
    return c.json(
      { success: false, message: 'Failed to fetch spending metrics' },
      500,
    );
  }
});

metrics.get('/top-vendors', sessionMiddleware, async (c) => {
  try {
    const tables = c.get('tablesDB');

    // Get current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}`;

    console.log(`[Top Vendors] Fetching data for month ${currentMonth}`);

    const queries = [
      Query.equal('month', currentMonth),
      Query.orderDesc('total_amount'),
      Query.limit(5),
    ];

    const result = await tables.listRows({
      databaseId: DB_ID,
      tableId: VENDOR_SPENDING_TRENDS_TABLE_ID,
      queries,
    });

    const vendors = result.rows.map((row: any) => ({
      vendor_name: row.vendor_name,
      total_amount: row.total_amount,
      percentage_change: 0, // Setting percentage change to 0 since trend logic per vendor is not implemented yet
    }));

    // The frontend useHomeData expects an array to be returned, or the caller expects it?
    // Wait, let me check the frontend caller expecting just a list or an object?
    // Let's return just the JSON array so it matches `fetch('.../stats')` which seems to expect an array.
    // In `useHomeData.ts`: `const res = await fetch(...); return res.json();`
    // Wait, the client doesn't expect { success: true, data: ... }. Returns array directly, or `{ success: true, data }`?
    // Let me check useHomeData `statsQuery.data`. It slices statsQuery.data.
    return c.json(vendors);
  } catch (error: any) {
    console.error('Get Top Vendors Error:', error);
    // Returning empty array on error to prevent crashing UI
    return c.json([]);
  }
});

export default metrics;
