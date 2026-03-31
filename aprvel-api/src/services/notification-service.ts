import { ID } from 'node-appwrite';
import { createAdminClient } from '../lib/appwrite';
import { DB_ID, NOTIFICATIONS_TABLE_ID } from '../config';

export async function createNotification(data: {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  related_order_id?: string;
}) {
  const { tablesDB, messaging } = await createAdminClient();

  // 1. Save to database so it shows up in the App Notification List
  const notification = await tablesDB.createRow({
    databaseId: DB_ID,
    tableId: NOTIFICATIONS_TABLE_ID, // Ensure you have this table
    rowId: ID.unique(),
    data: {
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      is_read: false,
      related_order_id: data.related_order_id || null,
      created_at: new Date().toISOString(),
    },
  });

  // 2. Trigger Appwrite FCM Push Notification
  try {
    await messaging.createPush({
      messageId: ID.unique(),
      title: data.title,
      body: data.message,
      data: data.related_order_id ? { orderId: data.related_order_id } : {},
      draft: false,
      targets: [],
      users: [data.user_id],
    });
  } catch (error) {
    console.error('Failed to dispatch Appwrite Push:', error);
  }

  return notification;
}
