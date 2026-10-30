import AsyncStorage from '@react-native-async-storage/async-storage';

const storageCache: Record<string, any> = {};

export const setItem = async (key: string, value?: any) => {
  try {
    if (value === null || value === undefined) {
      await removeItem(key);
      return;
    }
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, stringValue);
    storageCache[key] = stringValue;
  } catch (error) {
    console.error('Error setting item:', error);
  }
};

export const getItem = async <T = any>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);
    storageCache[key] = value;
    if (value === null || value === undefined) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    delete storageCache[key];
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const updateItem = async (key: string, value: any) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await AsyncStorage.mergeItem(key, stringValue);
  } catch (error) {
    console.error('Error updating item:', error);
  }
};

// Synchronous bridge helper for legacy sync retrievals
export const getSession = (key: string): string | null => {
  return storageCache[key] || null;
};

// Synchronous bridge helper for clearing sessions
export const clearSession = () => {
  Object.keys(storageCache).forEach((key) => {
    delete storageCache[key];
  });
  AsyncStorage.clear().catch((err) => {
    console.error('Error in clearSession:', err);
  });
};
