import { Hono } from 'hono';
import { Query } from 'node-appwrite';
import { sessionMiddleware } from '../lib/session-middleware';
import { DB_ID, NOTIFICATIONS_TABLE_ID } from '../config';

const notifications = new Hono();

// Fetch notifications for the logged-in user
notifications.get('/', sessionMiddleware, async (c) => {
  const tables = c.get('tablesDB');
  const user = c.get('user');

  const result = await tables.listRows({
    databaseId: DB_ID,
    tableId: NOTIFICATIONS_TABLE_ID,
    queries: [
      Query.equal('user_id', user.$id),
      Query.orderDesc('created_at'),
      Query.limit(50),
    ],
  });

  return c.json({ success: true, notifications: result.rows });
});

// Mark single as read
notifications.patch('/:id/read', sessionMiddleware, async (c) => {
  const tables = c.get('tablesDB');
  const id = c.req.param('id');

  await tables.updateRow({
    databaseId: DB_ID,
    tableId: NOTIFICATIONS_TABLE_ID,
    rowId: id,
    data: { is_read: true },
  });

  return c.json({ success: true });
});

// Mark all as read
notifications.post('/read-all', sessionMiddleware, async (c) => {
  const tables = c.get('tablesDB');
  const user = c.get('user');

  // Appwrite doesn't have a bulk update yet, so you must fetch unread and update in a loop
  const unread = await tables.listRows({
    databaseId: DB_ID,
    tableId: NOTIFICATIONS_TABLE_ID,
    queries: [Query.equal('user_id', user.$id), Query.equal('is_read', false)],
  });

  await Promise.all(
    unread.rows.map((row) =>
      tables.updateRow({
        databaseId: DB_ID,
        tableId: NOTIFICATIONS_TABLE_ID,
        rowId: row.$id,
        data: { is_read: true },
      }),
    ),
  );

  return c.json({ success: true });
});

export default notifications;
