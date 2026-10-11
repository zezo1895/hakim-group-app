import AsyncStorage from '@react-native-async-storage/async-storage';
import { decryptPayload } from '../utils/crypto';

const REMOTE_CONFIG_URL = 'https://raw.githubusercontent.com/zezo1895/hakim-group-app/main/config.json';
const STORAGE_KEY = 'hakim_api_url';
export const FALLBACK_API_URL = 'https://hakim-production-5171.up.railway.app/api';

/**
 * Initializes remote config by fetching from GitHub, decrypting, and updating cache.
 * Returns the resolved API URL.
 */
export async function initRemoteConfig() {
  try {
    const response = await fetch(REMOTE_CONFIG_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.payload) {
        const remoteUrl = decryptPayload(data.payload);
        if (remoteUrl && remoteUrl.startsWith('http')) {
          const cachedUrl = await AsyncStorage.getItem(STORAGE_KEY);
          if (cachedUrl !== remoteUrl) {
            await AsyncStorage.setItem(STORAGE_KEY, remoteUrl);
          }
          return remoteUrl;
        }
      }
    }
  } catch (error) {
    console.warn('[RemoteConfig] Failed to fetch remote config:', error.message || error);
  }

  // Fallback to locally cached URL or hardcoded fallback
  try {
    const cachedUrl = await AsyncStorage.getItem(STORAGE_KEY);
    if (cachedUrl) {
      return cachedUrl;
    }
  } catch (e) {
    console.warn('[RemoteConfig] Failed to read cached URL:', e);
  }

  return FALLBACK_API_URL;
}

/**
 * Gets the current API URL from AsyncStorage cache or fallback.
 * Can be called synchronously-like from app services after init.
 */
export async function getApiUrl() {
  try {
    const cachedUrl = await AsyncStorage.getItem(STORAGE_KEY);
    if (cachedUrl) {
      return cachedUrl;
    }
  } catch (e) {
    console.warn('[RemoteConfig] Error reading cached API URL:', e);
  }
  return FALLBACK_API_URL;
}

export default {
  initRemoteConfig,
  getApiUrl,
  FALLBACK_API_URL,
};
