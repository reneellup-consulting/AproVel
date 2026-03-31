import {
  Client,
  Databases,
  Users,
  Account,
  TablesDB,
  Messaging,
} from 'node-appwrite';
import { API_KEY, ENDPOINT, PROJECT_ID } from '../config';

// 1. ADMIN CLIENT (For Database/User Management)
export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
    get tablesDB() {
      return new TablesDB(client);
    },
    get messaging() {
      return new Messaging(client);
    },
  };
}

// 2. PUBLIC CLIENT (For Logging In)
export async function createPublicClient() {
  const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
  // NO API KEY HERE! This allows it to act as a normal user.

  return {
    get account() {
      return new Account(client);
    },
  };
}

// 3. SESSION CLIENT (For User Actions)
// Used when the React Native app passes a session secret to the API
export async function createSessionClient(secret: string) {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setSession(secret);

  return {
    get account() {
      return new Account(client);
    },
    get tablesDB() {
      return new TablesDB(client);
    },
  };
}
