import { createAdminClient } from '../lib/appwrite';
import { DB_ID, ORDERS_TABLE_ID } from '../config';
import { Query } from 'node-appwrite';

async function inspectOrder() {
  const { tablesDB } = await createAdminClient();
  try {
    const result = await tablesDB.listRows({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      queries: [Query.limit(1)],
    });
    if (result.rows.length > 0) {
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('No orders found.');
    }
  } catch (error) {
    console.error('Error fetching order:', error);
  }
}

inspectOrder();
