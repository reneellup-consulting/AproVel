import { Hono } from 'hono';
import { DB_ID, ORDER_LINES_TABLE_ID } from '../config';
import { createAdminClient } from '../lib/appwrite';

import { sessionMiddleware } from '../lib/session-middleware';

const orderLines = new Hono();

orderLines.delete('/', async (c) => {
  try {
    const { tablesDB: tables } = await createAdminClient();

    let allDeleted = false;
    let deletedCount = 0;

    // Loop to delete all rows in batches
    while (!allDeleted) {
      const result = await tables.deleteRows({
        databaseId: DB_ID,
        tableId: ORDER_LINES_TABLE_ID,
        queries: [],
      });

      const count = result.rows.length;
      deletedCount += count;

      if (count === 0) {
        allDeleted = true;
      }
    }

    return c.json({ success: true, message: `Deleted all order lines` });
  } catch (error: any) {
    console.error('Delete Order Lines Error:', error);
    return c.json(
      { success: false, message: 'Failed to delete order lines' },
      500,
    );
  }
});

orderLines.get('/:id', sessionMiddleware, async (c) => {
  try {
    const tables = c.get('tablesDB');
    const id = c.req.param('id');

    const result = await tables.getRow({
      databaseId: DB_ID,
      tableId: ORDER_LINES_TABLE_ID,
      rowId: id,
    });

    return c.json({
      success: true,
      orderLine: result,
    });
  } catch (error: any) {
    console.error('Get Order Lines Error:', error);
    return c.json(
      { success: false, message: 'Failed to get order lines' },
      500,
    );
  }
});

orderLines.patch('/:id', sessionMiddleware, async (c) => {
  try {
    const tables = c.get('tablesDB');
    const id = c.req.param('id');
    const { line_status, reason } = await c.req.json();

    console.log('Update Data:', line_status, reason);

    if (!line_status && !reason) {
      return c.json(
        { success: false, message: 'Status or reason is required' },
        400,
      );
    }

    const updateData: any = {};
    if (line_status) updateData.line_status = line_status;
    if (reason) updateData.reason = reason;

    console.log('Update Data:', updateData);

    const result = await tables.updateRow({
      databaseId: DB_ID,
      tableId: ORDER_LINES_TABLE_ID,
      rowId: id,
      data: updateData,
    });

    return c.json({
      success: true,
      message: 'Order line updated successfully',
      orderLine: result,
    });
  } catch (error: any) {
    console.error('Update Order Line Error:', error);
    return c.json(
      { success: false, message: 'Failed to update order line' },
      500,
    );
  }
});

export default orderLines;
