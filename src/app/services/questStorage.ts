import { Quest } from '../types';

const STORAGE_KEY = 'todo-quest-data';

export const saveQuests = (quests: Quest[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
  }
};

export const loadQuests = (): Quest[] => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('Failed to parse quest data from local storage', error);
      }
    }
  }
  return [];
};

export const addQuest = (quest: Quest): Quest[] => {
  const quests = loadQuests();
  const updatedQuests = [...quests, quest];
  saveQuests(updatedQuests);
  return updatedQuests;
};

export const updateQuest = (updatedQuest: Quest): Quest[] => {
  const quests = loadQuests();
  const updatedQuests = quests.map(quest => 
    quest.id === updatedQuest.id ? updatedQuest : quest
  );
  saveQuests(updatedQuests);
  return updatedQuests;
};

export const deleteQuest = (questId: string): Quest[] => {
  const quests = loadQuests();
  const updatedQuests = quests.filter(quest => quest.id !== questId);
  saveQuests(updatedQuests);
  return updatedQuests;
};

export const toggleQuestCompletion = (questId: string): Quest[] => {
  const quests = loadQuests();
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
  saveQuests(updatedQuests);
  return updatedQuests;
};

export const toggleSubtaskCompletion = (questId: string, subtaskId: string): Quest[] => {
  const quests = loadQuests();
  const updatedQuests = quests.map(quest => {
    if (quest.id === questId) {
      const updatedSubtasks = quest.subTasks.map(subtask => 
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
      );
      return { ...quest, subTasks: updatedSubtasks };
    }
    return quest;
  });
  saveQuests(updatedQuests);
  return updatedQuests;
}; 