import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { SessionUser } from '@/api/auth';

const TOKEN_KEY = 'taka.auth.token';
const USER_KEY = 'taka.auth.user';

/**
 * SecureStore has no web implementation, so web falls back to in-memory values
 * (which is fine for development — swap in cookies for production web).
 */
let memoryToken: string | null = null;
let memoryUser: SessionUser | null = null;

export async function saveToken(token: string): Promise<void> {
  memoryToken = token;
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') return memoryToken;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  memoryToken = null;
  if (Platform.OS === 'web') return;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Stores the account alongside its token. The Home screen needs the name to
 * greet the user, and there is no "who am I" endpoint to ask on relaunch.
 */
export async function saveSessionUser(user: SessionUser): Promise<void> {
  memoryUser = user;
  if (Platform.OS === 'web') return;
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (Platform.OS === 'web') return memoryUser;

  const stored = await SecureStore.getItemAsync(USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as SessionUser;
  } catch {
    // Corrupt or from an older shape: treat as signed out rather than crash.
    return null;
  }
}

/** Clears both halves of the session. */
export async function clearSession(): Promise<void> {
  memoryUser = null;
  await clearToken();
  if (Platform.OS === 'web') return;
  await SecureStore.deleteItemAsync(USER_KEY);
}
