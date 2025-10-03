export enum QuestCategory {
  MAIN = 'main',
  OPTIONAL = 'optional',
}

export interface SubTask {
  id: string;
  description: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  epicDescription: string;
  category: QuestCategory;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  dueDate?: number;
  subTasks: SubTask[];
  realLifeReward: string;
  visualReward?: string;
}

export interface QuestTemplate {
  id: string;
  name: string;
  title: string;
  category: QuestCategory;
  subtasks: string[];
  createdAt: number;
  usageCount: number;
} 