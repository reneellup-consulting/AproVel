import { createAdminClient } from '../lib/appwrite';
import { DB_ID, ORDERS_TABLE_ID } from '../config';
import { Query } from 'node-appwrite';

async function verifyFilters() {
  const { tablesDB } = await createAdminClient();

  console.log('--- Verifying Order Filters ---');

  try {
    // 1. Baseline: Count all orders
    const allOrders = await tablesDB.listRows({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      queries: [Query.limit(1)], // Just to get total
    });
    console.log(`Total orders in DB: ${allOrders.total}`);

    if (allOrders.total === 0) {
      console.log('No orders to test with. Exiting.');
      return;
    }

    // Fetch one order to get valid values for testing
    const sampleOrderReq = await tablesDB.listRows({
      databaseId: DB_ID,
      tableId: ORDERS_TABLE_ID,
      queries: [Query.limit(1)],
    });
    const sampleOrder = sampleOrderReq.rows[0];
    const testStatus = sampleOrder.status;
    const testPoType = sampleOrder.po_type;
    const testEntryDate = sampleOrder.entry_date;

    console.log(
      `Using sample order: ID=${sampleOrder.$id}, Status=${testStatus}, PO Type=${testPoType}, Entry Date=${testEntryDate}`,
    );

    // 2. Test Status Filter
    if (testStatus) {
      console.log(`\nTesting Status Filter: ${testStatus}`);
      const statusOrders = await tablesDB.listRows({
        databaseId: DB_ID,
        tableId: ORDERS_TABLE_ID,
        queries: [Query.equal('status', testStatus)],
      });
      console.log(`Orders with status '${testStatus}': ${statusOrders.total}`);
      const mismatch = statusOrders.rows.find((o) => o.status !== testStatus);
      if (mismatch) {
        console.error(
          'FAILED: Found order with mismatching status:',
          mismatch.status,
        );
      } else {
        console.log('PASSED: All returned orders have correct status.');
      }
    }

    // 3. Test PO Type Filter
    if (testPoType) {
      console.log(`\nTesting PO Type Filter: ${testPoType}`);
      const poTypeOrders = await tablesDB.listRows({
        databaseId: DB_ID,
        tableId: ORDERS_TABLE_ID,
        queries: [Query.equal('po_type', testPoType)],
      });
      console.log(`Orders with PO Type '${testPoType}': ${poTypeOrders.total}`);
      const mismatch = poTypeOrders.rows.find((o) => o.po_type !== testPoType);
      if (mismatch) {
        console.error(
          'FAILED: Found order with mismatching PO Type:',
          mismatch.po_type,
        );
      } else {
        console.log('PASSED: All returned orders have correct PO Type.');
      }
    }

    // 4. Test Date Range Filter
    if (testEntryDate) {
      // Create a range that definitely includes the sample date
      const dateObj = new Date(testEntryDate);
      const fromDate = new Date(dateObj);
      fromDate.setHours(0, 0, 0, 0); // Start of day
      const toDate = new Date(dateObj);
      toDate.setHours(23, 59, 59, 999); // End of day

      const fromStr = fromDate.toISOString();
      const toStr = toDate.toISOString();

      console.log(`\nTesting Date Range Filter: ${fromStr} to ${toStr}`);
      const dateOrders = await tablesDB.listRows({
        databaseId: DB_ID,
        tableId: ORDERS_TABLE_ID,
        queries: [
          Query.greaterThanEqual('entry_date', fromStr),
          Query.lessThanEqual('entry_date', toStr),
        ],
      });
      console.log(`Orders in date range: ${dateOrders.total}`);

      const mismatch = dateOrders.rows.find((o) => {
        const d = new Date(o.entry_date).getTime();
        return d < fromDate.getTime() || d > toDate.getTime();
      });

      if (mismatch) {
        console.error(
          'FAILED: Found order outside date range:',
          mismatch.entry_date,
        );
      } else {
        // Verify our sample order is in there
        const found = dateOrders.rows.find((o) => o.$id === sampleOrder.$id);
        if (found) {
          console.log(
            'PASSED: Sample order found in range and no outliers detected.',
          );
        } else {
          console.warn(
            'WARNING: Sample order NOT found in range (unexpected).',
          );
        }
      }
    }
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyFilters();
