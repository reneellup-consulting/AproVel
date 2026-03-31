import { apiUrl } from '@/constants';
import * as SecureStore from 'expo-secure-store';

export const SESSION_KEY = 'aprvel_session';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  if (!apiUrl) throw new Error('API Base URL missing');

  const sessionString = await SecureStore.getItemAsync(SESSION_KEY);

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (sessionString) {
    try {
      const session = JSON.parse(sessionString);
      if (session.secret) {
        headers.append('Cookie', `a_session=${session.secret}`);
        headers.set('x-appwrite-session', session.secret);
      } else {
        // Fallback if structured but no secret (shouldn't happen with valid session)
        headers.set('x-appwrite-session', sessionString);
      }
    } catch (e) {
      // Not JSON, assume legacy string token
      headers.append('Cookie', `a_session=${sessionString}`);
      headers.set('x-appwrite-session', sessionString);
    }
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};
