import { Quest } from '../types';
import * as localStorageService from './questStorage';
import * as indexedDBService from './indexedDBStorage';

// Determine which storage backend to use
function useIndexedDB(): boolean {
  return indexedDBService.isIndexedDBAvailable() && indexedDBService.isMigrationComplete();
}

// Unified save function
export async function saveQuests(quests: Quest[]): Promise<void> {
  if (useIndexedDB()) {
    await indexedDBService.saveQuestsDB(quests);
  } else {
    localStorageService.saveQuests(quests);
  }
}

// Unified load function
export async function loadQuests(): Promise<Quest[]> {
  if (useIndexedDB()) {
    return await indexedDBService.loadQuestsDB();
  } else {
    return localStorageService.loadQuests();
  }
}

// Unified add quest
export async function addQuest(quest: Quest): Promise<Quest[]> {
  if (useIndexedDB()) {
    return await indexedDBService.addQuestDB(quest);
  } else {
    return localStorageService.addQuest(quest);
  }
}

// Unified update quest
export async function updateQuest(updatedQuest: Quest): Promise<Quest[]> {
  if (useIndexedDB()) {
    return await indexedDBService.updateQuestDB(updatedQuest);
  } else {
    return localStorageService.updateQuest(updatedQuest);
  }
}

// Unified delete quest
export async function deleteQuest(questId: string): Promise<Quest[]> {
  if (useIndexedDB()) {
    return await indexedDBService.deleteQuestDB(questId);
  } else {
    return localStorageService.deleteQuest(questId);
  }
}

// Unified toggle quest completion
export async function toggleQuestCompletion(questId: string): Promise<Quest[]> {
  if (useIndexedDB()) {
    return await indexedDBService.toggleQuestCompletionDB(questId);
  } else {
    return localStorageService.toggleQuestCompletion(questId);
  }
}

// Unified toggle subtask completion
export async function toggleSubtaskCompletion(questId: string, subtaskId: string): Promise<Quest[]> {
  if (useIndexedDB()) {
    return await indexedDBService.toggleSubtaskCompletionDB(questId, subtaskId);
  } else {
    return localStorageService.toggleSubtaskCompletion(questId, subtaskId);
  }
}

// Migration helper
export async function performMigrationIfNeeded(): Promise<{ migrated: boolean; error?: string }> {
  try {
    // Check if IndexedDB is available
    if (!indexedDBService.isIndexedDBAvailable()) {
      return { migrated: false, error: 'IndexedDB not available' };
    }

    // Check if already migrated
    if (indexedDBService.isMigrationComplete()) {
      return { migrated: false, error: 'Already migrated' };
    }

    // Perform migration
    const success = await indexedDBService.migrateFromLocalStorage();

    if (success) {
      return { migrated: true };
    } else {
      return { migrated: false, error: 'No data to migrate' };
    }
  } catch (error) {
    console.error('Migration error:', error);
    return { migrated: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
