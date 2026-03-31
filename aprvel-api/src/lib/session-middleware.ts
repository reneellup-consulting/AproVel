import {
  Account,
  Client,
  Storage,
  TablesDB,
  type Models,
  type Account as AccountType,
  type TablesDB as TablesDBType,
  type Storage as StorageType,
  type Users as UsersType,
} from 'node-appwrite';

import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import { AUTH_COOKIE } from '../../constant';
import { ENDPOINT, PROJECT_ID } from '../config';
import type { AppPreferences } from './types';

type AdditionalContext = {
  Variables: {
    account: AccountType;
    tablesDB: TablesDBType;
    storage: StorageType;
    users: UsersType;
    user: Models.User<AppPreferences>;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

    const session =
      c.req.header('x-appwrite-session') || getCookie(c, AUTH_COOKIE);

    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    client.setSession(session);

    const account = new Account(client);
    const tablesDB = new TablesDB(client);
    const storage = new Storage(client);

    const user = await account.get<AppPreferences>();

    c.set('account', account);
    c.set('tablesDB', tablesDB);
    c.set('storage', storage);
    c.set('user', user);

    await next();
  },
);
