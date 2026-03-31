import {
  Client,
  Databases,
  ID,
  Permission,
  Role,
  IndexType,
  OrderBy,
} from 'node-appwrite';
import { DB_ID, ENDPOINT, PROJECT_ID, API_KEY } from '../config';

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

const setupVendorSpendingTrends = async () => {
  try {
    console.log('Creating Vendor Spending Trends collection...');

    // Create Collection
    const collection = await databases.createCollection(
      DB_ID,
      ID.unique(),
      'vendor_spending_trends',
      [
        Permission.read(Role.any()), // Anyone can read metrics
        Permission.write(Role.users()), // Authenticated users can write
      ],
    );

    const collectionId = collection.$id;
    console.log(`Collection created with ID: ${collectionId}`);

    // Create Attributes
    console.log('Creating attributes...');

    // month: e.g., '2026-02'
    await databases.createStringAttribute(
      DB_ID,
      collectionId,
      'month',
      10, // Max length for YYYY-MM
      true, // required
    );

    // vendor_name
    await databases.createStringAttribute(
      DB_ID,
      collectionId,
      'vendor_name',
      50,
      true, // required
    );

    // total_amount: Numeric value of aggregated spending
    await databases.createFloatAttribute(
      DB_ID,
      collectionId,
      'total_amount',
      true, // required
      0, // default value
    );

    console.log('Attributes created.');
    console.log('Waiting for attributes to be available before indexing...');

    // Wait a bit for indexing
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Create Index on month to easily search/sort by month
    console.log('Creating index for querying by month...');
    await databases.createIndex(
      DB_ID,
      collectionId,
      'month_index',
      IndexType.Key,
      ['month'],
      [OrderBy.Desc],
    );

    console.log('Setup complete!');
    console.log('--- ACTION REQUIRED ---');
    console.log('Add the following to your aprvel-api/.env file:');
    console.log(
      `APRVEL_PUBLIC_APPWRITE_VENDOR_SPENDING_TRENDS_TABLE_ID=${collectionId}`,
    );
    console.log('-------------------------');
  } catch (error) {
    console.error('Error setting up vendor spending trends collection:', error);
  }
};

setupVendorSpendingTrends();
