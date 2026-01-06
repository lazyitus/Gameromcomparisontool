// IndexedDB storage for large DAT files and ROM lists
const DB_NAME = 'rom-manager-db';
const DB_VERSION = 1;
const DAT_STORE = 'dat-files';
const ROM_STORE = 'rom-lists';

let db: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(DAT_STORE)) {
        db.createObjectStore(DAT_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(ROM_STORE)) {
        db.createObjectStore(ROM_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function saveDatFiles(datFiles: any[]): Promise<void> {
  try {
    const database = await getDB();
    const transaction = database.transaction([DAT_STORE], 'readwrite');
    const store = transaction.objectStore(DAT_STORE);

    // Clear existing data
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add all DAT files
    for (const datFile of datFiles) {
      await new Promise<void>((resolve, reject) => {
        const addRequest = store.add(datFile);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      });
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error saving DAT files to IndexedDB:', error);
  }
}

export async function loadDatFiles(): Promise<any[]> {
  try {
    const database = await getDB();
    const transaction = database.transaction([DAT_STORE], 'readonly');
    const store = transaction.objectStore(DAT_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error loading DAT files from IndexedDB:', error);
    return [];
  }
}

export async function saveRomLists(romLists: any[]): Promise<void> {
  try {
    const database = await getDB();
    const transaction = database.transaction([ROM_STORE], 'readwrite');
    const store = transaction.objectStore(ROM_STORE);

    // Clear existing data
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add all ROM lists
    for (const romList of romLists) {
      await new Promise<void>((resolve, reject) => {
        const addRequest = store.add(romList);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      });
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error saving ROM lists to IndexedDB:', error);
  }
}

export async function loadRomLists(): Promise<any[]> {
  try {
    const database = await getDB();
    const transaction = database.transaction([ROM_STORE], 'readonly');
    const store = transaction.objectStore(ROM_STORE);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error loading ROM lists from IndexedDB:', error);
    return [];
  }
}
