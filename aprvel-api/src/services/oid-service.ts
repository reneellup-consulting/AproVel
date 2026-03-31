import { ID } from 'node-appwrite';
import { createSessionClient } from '../lib/appwrite';
import {
  AVAILABLE_OIDS_TABLE_ID,
  CLAIMED_QUEUE_TABLE_ID,
  DB_ID,
} from '../config';

export async function verifyAndClaimOid(
  oid: string,
  userId: string,
  secret: string,
) {
  const { tablesDB, account } = await createSessionClient(secret);

  try {
    // GET DATA: Fetch the row first to get the permission data
    // We expect the rowId to be the OID. This will throw if not found.

    const row = await tablesDB.getRow({
      databaseId: DB_ID,
      tableId: AVAILABLE_OIDS_TABLE_ID,
      rowId: oid,
    });

    const permission = row.permission; // Capture the permission (e.g., 'fuel', 'all')

    // ATOMIC CLAIM: Try to delete the OID from the 'available_oids' cache.
    // If we successfully fetched it but fail to delete it, it means a race condition occurred
    // and someone else claimed it milliseconds ago.
    await tablesDB.deleteRow({
      databaseId: DB_ID,
      tableId: AVAILABLE_OIDS_TABLE_ID,
      rowId: oid,
    });

    // Add to the processing queue for the Windows Service.
    await tablesDB.createRow({
      databaseId: DB_ID,
      tableId: CLAIMED_QUEUE_TABLE_ID,
      rowId: ID.unique(),
      data: {
        oid: oid,
        user_id: userId,
      },
    });

    // Link to user profile immediately with BOTH approver_id and permission
    await account.updatePrefs({
      prefs: {
        approver_id: oid,
        permission: permission,
      },
    });

    return {
      success: true,
      message: 'OID Verified and Linked.',
      permission: permission, // Return this so index.ts can use it in the response
    };
  } catch (error) {
    // If getRow or deleteRow failed, the OID was not available.
    console.error('Error verifying OID:', error);
    return { success: false, message: 'Invalid or already used OID.' };
  }
}
