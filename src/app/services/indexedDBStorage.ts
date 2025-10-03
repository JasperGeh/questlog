import { Quest } from '../types';

const DB_NAME = 'todo-quest-db';
const DB_VERSION = 1;
const STORE_NAME = 'quests';

// Open or create the IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

        // Create indexes for efficient querying
        objectStore.createIndex('completed', 'completed', { unique: false });
        objectStore.createIndex('category', 'category', { unique: false });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        objectStore.createIndex('dueDate', 'dueDate', { unique: false });
      }
    };
  });
}

// Save all quests to IndexedDB
export async function saveQuestsDB(quests: Quest[]): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  // Clear existing quests
  await new Promise<void>((resolve, reject) => {
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => resolve();
    clearRequest.onerror = () => reject(clearRequest.error);
  });

  // Add all quests
  for (const quest of quests) {
    await new Promise<void>((resolve, reject) => {
      const addRequest = store.add(quest);
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    });
  }

  db.close();
}

// Load all quests from IndexedDB
export async function loadQuestsDB(): Promise<Quest[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error);
    return [];
  }
}

// Add a single quest
export async function addQuestDB(quest: Quest): Promise<Quest[]> {
  const quests = await loadQuestsDB();
  const updatedQuests = [...quests, quest];
  await saveQuestsDB(updatedQuests);
  return updatedQuests;
}

// Update a single quest
export async function updateQuestDB(updatedQuest: Quest): Promise<Quest[]> {
  const quests = await loadQuestsDB();
  const updatedQuests = quests.map(quest =>
    quest.id === updatedQuest.id ? updatedQuest : quest
  );
  await saveQuestsDB(updatedQuests);
  return updatedQuests;
}

// Delete a quest
export async function deleteQuestDB(questId: string): Promise<Quest[]> {
  const quests = await loadQuestsDB();
  const updatedQuests = quests.filter(quest => quest.id !== questId);
  await saveQuestsDB(updatedQuests);
  return updatedQuests;
}

// Toggle quest completion
export async function toggleQuestCompletionDB(questId: string): Promise<Quest[]> {
  const quests = await loadQuestsDB();
  const updatedQuests = quests.map(quest => {
    if (quest.id === questId) {
      return {
        ...quest,
        completed: !quest.completed,
        completedAt: !quest.completed ? Date.now() : undefined
      };
    }
    return quest;
  });
  await saveQuestsDB(updatedQuests);
  return updatedQuests;
}

// Toggle subtask completion
export async function toggleSubtaskCompletionDB(questId: string, subtaskId: string): Promise<Quest[]> {
  const quests = await loadQuestsDB();
  const updatedQuests = quests.map(quest => {
    if (quest.id === questId) {
      const updatedSubtasks = quest.subTasks.map(subtask =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      );
      return { ...quest, subTasks: updatedSubtasks };
    }
    return quest;
  });
  await saveQuestsDB(updatedQuests);
  return updatedQuests;
}

// Migrate data from localStorage to IndexedDB
export async function migrateFromLocalStorage(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;

    const STORAGE_KEY = 'todo-quest-data';
    const localData = localStorage.getItem(STORAGE_KEY);

    if (!localData) {
      console.log('No localStorage data to migrate');
      return false;
    }

    const quests: Quest[] = JSON.parse(localData);

    if (quests.length === 0) {
      console.log('No quests to migrate');
      return false;
    }

    console.log(`Migrating ${quests.length} quests from localStorage to IndexedDB...`);
    await saveQuestsDB(quests);

    // Mark migration as complete
    localStorage.setItem('todo-quest-migrated', 'true');

    console.log('Migration complete!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Check if migration has been completed
export function isMigrationComplete(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('todo-quest-migrated') === 'true';
}

// Check if IndexedDB is available
export function isIndexedDBAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return 'indexedDB' in window;
}
