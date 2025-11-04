import type { StateStorage } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';

/**
 * IndexedDB storage adapter for Zustand persist middleware
 * Provides better performance and larger storage capacity than localStorage
 */
const indexedDbRawStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      // Open IndexedDB database
      const db = await openDatabase();
      const tx = db.transaction(['zustand'], 'readonly');
      const store = tx.objectStore('zustand');
      const result = await promisify<IDBRequest, any>(store.get(name));

      return result ? result.value : null;
    } catch (error) {
      console.error(`Error reading from IndexedDB for key: ${name}`, error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const db = await openDatabase();
      const tx = db.transaction(['zustand'], 'readwrite');
      const store = tx.objectStore('zustand');
      await promisify(store.put({ id: name, value }));
    } catch (error) {
      console.error(`Error writing to IndexedDB for key: ${name}`, error);
      throw error;
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await openDatabase();
      const tx = db.transaction(['zustand'], 'readwrite');
      const store = tx.objectStore('zustand');
      await promisify(store.delete(name));
    } catch (error) {
      console.error(`Error deleting from IndexedDB for key: ${name}`, error);
    }
  },
};

/**
 * Wrapper that creates a proper PersistStorage from our StateStorage
 * This handles JSON serialization/deserialization automatically
 */
export const indexedDbStorage = createJSONStorage(() => indexedDbRawStorage);

/**
 * Open IndexedDB database with zustand object store
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('zustand-db', 1);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains('zustand')) {
        db.createObjectStore('zustand', { keyPath: 'id' });
      }
    };
  });
}

/**
 * Utility function to promisify IDBRequest
 */
function promisify<T extends IDBRequest, R = any>(
  request: T
): Promise<R | null> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

