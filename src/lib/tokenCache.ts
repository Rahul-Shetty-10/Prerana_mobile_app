import type { TokenCache } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const tokenCache: TokenCache = {
  async getToken(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      console.error("[Clerk][tokenCache] Failed to read the authentication cache.");
      return null;
    }
  },
  async saveToken(key, token) {
    try {
      await AsyncStorage.setItem(key, token);
    } catch (err) {
      console.error("[Clerk][tokenCache] Failed to save the authentication cache.");
    }
  },
  async clearToken(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.error("[Clerk][tokenCache] Failed to clear the authentication cache.");
    }
  },
};


