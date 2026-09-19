import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'taka.auth.token';

/**
 * SecureStore has no web implementation, so web falls back to an in-memory
 * value (which is fine for development — swap in cookies for production web).
 */
let memoryToken: string | null = null;

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
