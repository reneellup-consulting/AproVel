import type { Models } from 'node-appwrite';

export interface AppPreferences extends Models.Preferences {
  approver_id?: string;
}
