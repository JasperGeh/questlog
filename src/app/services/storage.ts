import { Quest } from '../types';
import * as localStorageService from './questStorage';
import * as indexedDBService from './indexedDBStorage';

// Determine which storage backend to use
function useIndexedDB(): boolean {
  return indexedDBService.isIndexedDBAvailable() && indexedDBService.isMigrationComplete();
}

// Unified save function with error handling
export async function saveQuests(quests: Quest[]): Promise<void> {
  try {
    if (useIndexedDB()) {
      await indexedDBService.saveQuestsDB(quests);
    } else {
      localStorageService.saveQuests(quests);
    }
  } catch (error) {
    console.error('Failed to save quests:', error);
    // Fallback to localStorage if IndexedDB fails
    if (useIndexedDB()) {
      console.warn('Falling back to localStorage');
      localStorageService.saveQuests(quests);
    } else {
      throw new Error('Failed to save quests to storage');
    }
  }
}

// Unified load function with error handling
export async function loadQuests(): Promise<Quest[]> {
  try {
    if (useIndexedDB()) {
      return await indexedDBService.loadQuestsDB();
    } else {
      return localStorageService.loadQuests();
    }
  } catch (error) {
    console.error('Failed to load quests:', error);
    // Fallback to localStorage if IndexedDB fails
    if (useIndexedDB()) {
      console.warn('Falling back to localStorage');
      return localStorageService.loadQuests();
    }
    return [];
  }
}

// Unified add quest with error handling
export async function addQuest(quest: Quest): Promise<Quest[]> {
  try {
    if (useIndexedDB()) {
      return await indexedDBService.addQuestDB(quest);
    } else {
      return localStorageService.addQuest(quest);
    }
  } catch (error) {
    console.error('Failed to add quest:', error);
    throw new Error('Failed to add quest to storage');
  }
}

// Unified update quest with error handling
export async function updateQuest(updatedQuest: Quest): Promise<Quest[]> {
  try {
    if (useIndexedDB()) {
      return await indexedDBService.updateQuestDB(updatedQuest);
    } else {
      return localStorageService.updateQuest(updatedQuest);
    }
  } catch (error) {
    console.error('Failed to update quest:', error);
    throw new Error('Failed to update quest in storage');
  }
}

// Unified delete quest with error handling
export async function deleteQuest(questId: string): Promise<Quest[]> {
  try {
    if (useIndexedDB()) {
      return await indexedDBService.deleteQuestDB(questId);
    } else {
      return localStorageService.deleteQuest(questId);
    }
  } catch (error) {
    console.error('Failed to delete quest:', error);
    throw new Error('Failed to delete quest from storage');
  }
}

// Unified toggle quest completion with error handling
export async function toggleQuestCompletion(questId: string): Promise<Quest[]> {
  try {
    if (useIndexedDB()) {
      return await indexedDBService.toggleQuestCompletionDB(questId);
    } else {
      return localStorageService.toggleQuestCompletion(questId);
    }
  } catch (error) {
    console.error('Failed to toggle quest completion:', error);
    throw new Error('Failed to update quest completion status');
  }
}

// Unified toggle subtask completion with error handling
export async function toggleSubtaskCompletion(questId: string, subtaskId: string): Promise<Quest[]> {
  try {
    if (useIndexedDB()) {
      return await indexedDBService.toggleSubtaskCompletionDB(questId, subtaskId);
    } else {
      return localStorageService.toggleSubtaskCompletion(questId, subtaskId);
    }
  } catch (error) {
    console.error('Failed to toggle subtask completion:', error);
    throw new Error('Failed to update subtask completion status');
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
