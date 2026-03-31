import { Hono } from 'hono';
import {
  DB_ID,
  ORDERS_TABLE_ID,
  ORDER_LINES_TABLE_ID,
  SEARCH_HISTORY_TABLE_ID,
  SPENDING_TRENDS_TABLE_ID,
  VENDOR_SPENDING_TRENDS_TABLE_ID,
} from '../config';

import { sessionMiddleware } from '../lib/session-middleware';
import { Query, ID } from 'node-appwrite';
import { createAdminClient } from '../lib/appwrite';
import { createNotification } from '../services/notification-service';

const orders = new Hono();

orders.delete('/', async (c) => {
  try {
    const { tablesDB: tables } = await createAdminClient();

    let allDeleted = false;
    let deletedCount = 0;

    // Loop to delete all rows in batches
    while (!allDeleted) {
      const result = await tables.deleteRows({
        databaseId: DB_ID,
        tableId: ORDERS_TABLE_ID,
        queries: [],
      });

      const count = result.rows.length;
      deletedCount += count;

      if (count === 0) {
        allDeleted = true;
      }
    }

    return c.json({ success: true, message: `Deleted all orders` });
  } catch (error: any) {
    console.error('Delete Orders Error:', error);
    return c.json({ success: false, message: 'Failed to delete orders' }, 500);
  }
});

orders.get('/', sessionMiddleware, async (c) => {
  try {
    const tables = c.get('tablesDB');
    const cursor = c.req.query('cursor');
    const limit = Number(c.req.query('limit')) || 100;

    // Use queries() to get array of values (e.g. ?status=Pending&status=Approved)
    const statuses = c.req.queries('status');
    const po_type = c.req.query('po_type');
    const from = c.req.query('from');
    const to = c.req.query('to');
    const search = c.req.query('search');

    const queries = [Query.limit(limit), Query.orderDesc('entry_date')];

    if (search) {
      queries.push(
        Query.or([
          Query.search('source_no', search),
          Query.search('vendor', search),
          Query.search('unit_no', search),
          Query.search('driver', search),
        ]),
      );
    }

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    if (statuses && statuses.length > 0) {
      // Appwrite Query.equal supports array for "IN" (OR) logic
      queries.push(Query.equal('status', statuses));
    }

    if (po_type) {
      queries.push(Query.equal('po_type', po_type));
    }

    if (from) {
      queries.push(Query.greaterThanEqual('entry_date', from));
    }

    if (to) {
      queries.push(Query.lessThanEqual('entry_date', to));
    }

    const user = c.get('user');

    // Save search history if search term exists
    if (search && user) {
      // Async fire-and-forget (or await if desired, but don't block response too long)
      // We'll await it to ensure it's saved, as performance impact should be minimal
      try {
        await tables.createRow({
          databaseId: DB_ID,
          tableId: SEARCH_HISTORY_TABLE_ID,
          rowId: ID.unique(),
          data: {
            user_id: user.$id,
            query: search,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.error('Failed to save search history', err);
      }
    }

    const result = await tables.listRows({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      queries,
    });

    // FIX: The N+1 query is gone! The `amount` field is already on the document
    // thanks to the SQL CTE and C# Bulk Generator.
    return c.json({
      success: true,
      orders: result.rows,
      nextCursor:
        result.rows.length > 0 ? result.rows[result.rows.length - 1].$id : null,
    });
  } catch (error: any) {
    console.error('Get Orders Error:', error);
    return c.json({ success: false, message: 'Failed to get orders' }, 500);
  }
});

orders.get('/recommendations', sessionMiddleware, async (c) => {
  try {
    const tables = c.get('tablesDB');
    const user = c.get('user');

    // 1. Get user's recent search history
    const history = await tables.listRows({
      databaseId: DB_ID,
      tableId: SEARCH_HISTORY_TABLE_ID,
      queries: [
        Query.equal('user_id', user.$id),
        Query.orderDesc('timestamp'),
        Query.limit(5),
      ],
    });

    if (history.total === 0) {
      return c.json({ success: true, orders: [] });
    }

    // Extract unique search terms
    const terms = [
      ...new Set(history.rows.map((row: any) => row.query as string)),
    ].slice(0, 3); // Take top 3 unique terms

    if (terms.length === 0) {
      return c.json({ success: true, orders: [] });
    }

    // 2. Query orders based on these terms
    // tailored to match 'source_no', 'vendor', 'unit_no', etc.
    // We construct a big OR query.
    const searchQueries = terms.flatMap((term) => [
      Query.search('source_no', term),
      Query.search('vendor', term),
      Query.search('unit_no', term),
      Query.search('driver', term),
    ]);

    // Appwrite might limit number of OR clauses. If too many, maybe simplify or just use latest term.
    // For now, let's try combined.
    const ordersResult = await tables.listRows({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      queries: [
        Query.limit(10),
        Query.orderDesc('entry_date'),
        Query.equal('status', 'Pending'),
        Query.greaterThan('amount', 0),
        Query.or(searchQueries),
      ],
    });

    return c.json({
      success: true,
      orders: ordersResult.rows,
    });
  } catch (error: any) {
    console.error('Get Recommendations Error:', error);
    // Return empty list on error to avoid breaking UI
    return c.json({ success: true, orders: [] });
  }
});

orders.delete('/:id', sessionMiddleware, async (c) => {
  try {
    const tables = c.get('tablesDB');
    const id = c.req.param('id');

    await tables.deleteRow({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      rowId: id,
    });

    return c.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Delete Order Error:', error);
    return c.json({ success: false, message: 'Failed to delete order' }, 500);
  }
});

orders.patch('/:id', sessionMiddleware, async (c) => {
  try {
    const tables = c.get('tablesDB');
    const id = c.req.param('id');
    const { status, rejection_reason, remarks } = await c.req.json();

    if (!status && remarks === undefined) {
      return c.json(
        { success: false, message: 'Status or remarks is required' },
        400,
      );
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      // When status changes (Approved/Rejected), save the user who did it and the timestamp
      updateData.status_aprvel_by = c.get('user').$id;
      updateData.status_date = new Date().toISOString();
    }
    if (rejection_reason) updateData.rejection_reason = rejection_reason;
    if (remarks !== undefined) updateData.remarks = remarks;

    const listResult = await tables.listRows({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      queries: [Query.equal('$id', id)],
    });

    if (listResult.rows.length === 0) {
      return c.json({ success: false, message: 'Order not found' }, 404);
    }

    // Appwrite updateRow requires just the ID
    const result = await tables.updateRow({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      rowId: id,
      data: updateData,
    });

    // Update spending trends if the order was just approved
    if (status?.toLowerCase() === 'approved') {
      try {
        const orderDoc = listResult.rows[0];
        const amount = Number(orderDoc.amount) || 0;
        console.log(
          `[Spending Trend] Order Approved. Amount: ${amount}, Doc ID: ${orderDoc.$id}`,
        );

        if (amount > 0) {
          // Format month as YYYY-MM based on the current date
          const now = new Date();
          const currentMonth = `${now.getFullYear()}-${String(
            now.getMonth() + 1,
          ).padStart(2, '0')}`;

          console.log(
            `[Spending Trend] Updating for month ${currentMonth} in table ${SPENDING_TRENDS_TABLE_ID}`,
          );

          const trendQueries = [Query.equal('month', currentMonth)];

          const trendResult = await tables.listRows({
            databaseId: DB_ID,
            tableId: SPENDING_TRENDS_TABLE_ID,
            queries: trendQueries,
          });

          if (trendResult.rows.length > 0) {
            // Document exists, update it
            const existingDoc = trendResult.rows[0];
            console.log(
              `[Spending Trend] Existing row found. Add ${amount} to ${existingDoc.total_amount}`,
            );
            await tables.updateRow({
              databaseId: DB_ID,
              tableId: SPENDING_TRENDS_TABLE_ID,
              rowId: existingDoc.$id,
              data: {
                total_amount: existingDoc.total_amount + amount,
              },
            });
          } else {
            // Document does not exist, create it
            console.log(
              `[Spending Trend] No existing row. Creating new row for ${currentMonth} with amount ${amount}`,
            );
            await tables.createRow({
              databaseId: DB_ID,
              tableId: SPENDING_TRENDS_TABLE_ID,
              rowId: ID.unique(),
              data: {
                month: currentMonth,
                total_amount: amount,
              },
            });
          }
          console.log(`[Spending Trend] Successfully updated.`);

          // --- Vendor Spending Trend Tracking ---
          const vendorName = orderDoc.vendor;
          if (vendorName) {
            console.log(
              `[Vendor Spending Trend] Updating for month ${currentMonth}, vendor ${vendorName} in table ${VENDOR_SPENDING_TRENDS_TABLE_ID}`,
            );

            const vendorTrendQueries = [
              Query.equal('month', currentMonth),
              Query.equal('vendor_name', vendorName),
            ];

            const vendorTrendResult = await tables.listRows({
              databaseId: DB_ID,
              tableId: VENDOR_SPENDING_TRENDS_TABLE_ID,
              queries: vendorTrendQueries,
            });

            if (vendorTrendResult.rows.length > 0) {
              const existingVendorDoc = vendorTrendResult.rows[0];
              console.log(
                `[Vendor Spending Trend] Existing row found. Add ${amount} to ${existingVendorDoc.total_amount}`,
              );
              await tables.updateRow({
                databaseId: DB_ID,
                tableId: VENDOR_SPENDING_TRENDS_TABLE_ID,
                rowId: existingVendorDoc.$id,
                data: {
                  total_amount: existingVendorDoc.total_amount + amount,
                },
              });
            } else {
              console.log(
                `[Vendor Spending Trend] No existing row. Creating new row for ${currentMonth}, ${vendorName} with amount ${amount}`,
              );
              await tables.createRow({
                databaseId: DB_ID,
                tableId: VENDOR_SPENDING_TRENDS_TABLE_ID,
                rowId: ID.unique(),
                data: {
                  month: currentMonth,
                  vendor_name: vendorName,
                  total_amount: amount,
                },
              });
            }
            console.log(`[Vendor Spending Trend] Successfully updated.`);
          }
        } else {
          console.log(
            `[Spending Trend] Skipped tracking because amount is 0 or invalid.`,
          );
        }
      } catch (trendError) {
        console.error('Failed to update spending trends:', trendError);
        // Do not fail the request if trend update fails, just log it.
      }
    }

    // Fetch the order to get the owner/creator's user_id
    const orderDoc = listResult.rows[0];

    if (status) {
      const title =
        status.toLowerCase() === 'approved' ? `PO Approved` : `PO Rejected`;
      const message =
        status.toLowerCase() === 'approved'
          ? `Your request for ${orderDoc.vendor} has been approved.`
          : `Purchase Order was rejected. Reason: ${rejection_reason || 'N/A'}`;
      const type = status.toLowerCase() === 'approved' ? 'success' : 'alert';

      const { users } = await createAdminClient();
      const allUsers = await users.list();
      
      const otherUsers = allUsers.users.filter((u: any) => {
        if (u.$id === c.get('user').$id) return false;
        
        // Filter out users who do not have permission for this PO Type
        const userPermission = u.prefs?.permission?.toLowerCase();
        const orderPoType = orderDoc.po_type?.toLowerCase();

        return userPermission === 'all' || userPermission === orderPoType;
      });

      await Promise.all(
        otherUsers.map((u: any) =>
          createNotification({
            user_id: u.$id,
            title,
            message,
            type,
            related_order_id: id,
          })
        )
      );
    }

    return c.json({
      success: true,
      message: 'Order updated successfully',
      order: result,
    });
  } catch (error: any) {
    console.error('Update Order Error:', error);
    return c.json({ success: false, message: 'Failed to update order' }, 500);
  }
});

orders.get('/:id', sessionMiddleware, async (c) => {
  try {
    const tables = c.get('tablesDB');
    const id = c.req.param('id');

    // 1. Fetch the main order document
    const order = await tables.getRow({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      rowId: id,
    });

    const lines = await tables.listRows({
      databaseId: DB_ID,
      tableId: ORDER_LINES_TABLE_ID,
      queries: [Query.equal('parent_id', order.po_id)],
    });

    return c.json({
      success: true,
      order,
      lines: lines.rows,
      // We don't strictly need to recalculate total_amount here anymore since
      // `order.amount` exists, but we can return it if the mobile app expects it.
      total_amount: order.amount,
    });
  } catch (error: any) {
    console.error('Get Order Detail Error:', error);
    return c.json(
      { success: false, message: 'Failed to get order details' },
      500,
    );
  }
});

export default orders;
