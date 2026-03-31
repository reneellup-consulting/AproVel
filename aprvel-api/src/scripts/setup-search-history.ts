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

const setupSearchHistory = async () => {
  try {
    console.log('Creating Search History collection...');

    // Create Collection
    const collection = await databases.createCollection(
      DB_ID,
      ID.unique(),
      'search_history',
      [
        Permission.read(Role.any()), // Might want to restrict this later
        Permission.write(Role.users()),
        Permission.read(Role.users()),
      ],
    );

    const collectionId = collection.$id;
    console.log(`Collection created with ID: ${collectionId}`);

    // Create Attributes
    console.log('Creating attributes...');

    // user_id: to link search to a user
    await databases.createStringAttribute(
      DB_ID,
      collectionId,
      'user_id',
      255,
      true,
    );

    // query: the search term
    await databases.createStringAttribute(
      DB_ID,
      collectionId,
      'query',
      255,
      true,
    );

    // timestamp: when the search happened
    await databases.createDatetimeAttribute(
      DB_ID,
      collectionId,
      'timestamp',
      true,
    );

    console.log('Attributes created.');
    console.log('Waiting for attributes to be available...');

    // Wait a bit for indexing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create Index
    console.log('Creating indexes...');
    await databases.createIndex(
      DB_ID,
      collectionId,
      'user_timestamp',
      IndexType.Key,
      ['user_id', 'timestamp'],
      [OrderBy.Desc, OrderBy.Desc],
    );

    console.log('Setup complete!');
    console.log('Add this to your .env file:');
    console.log(
      `APRVEL_PUBLIC_APPWRITE_SEARCH_HISTORY_TABLE_ID=${collectionId}`,
    );
  } catch (error) {
    console.error('Error setting up search history:', error);
  }
};

setupSearchHistory();
