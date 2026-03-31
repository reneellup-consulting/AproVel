import { createAdminClient } from './src/lib/appwrite';
import { DB_ID, ORDERS_TABLE_ID } from './src/config';
import { Query } from 'node-appwrite';

async function inspectData() {
  const { tablesDB, users } = await createAdminClient();

  // 1. Get sample users
  try {
    const userList = await users.list();
    console.log('--- SAMPLE USERS ---');
    userList.users.slice(0, 5).forEach(u => {
      console.log(`User: ${u.email}, Prefs:`, u.prefs);
    });
  } catch (err) {
    console.error('Error fetching users:', err);
  }

  // 2. Get sample orders
  try {
    const orderList = await tablesDB.listRows({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      queries: [Query.limit(5)]
    });
    console.log('\n--- SAMPLE ORDERS ---');
    orderList.rows.forEach(o => {
      console.log(`Order ID: ${o.$id}, PO Type: ${o.po_type}`);
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
  }
}

inspectData();
