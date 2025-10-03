import { QuestTemplate, QuestCategory } from '../types';

const TEMPLATE_STORAGE_KEY = 'quest-templates';

// Built-in templates
const BUILTIN_TEMPLATES: QuestTemplate[] = [
  {
    id: 'daily-standup',
    name: 'Daily Standup',
    title: 'Attend daily standup meeting',
    category: QuestCategory.MAIN,
    subtasks: ['Review yesterday\'s progress', 'Share today\'s plan', 'Flag any blockers'],
    createdAt: Date.now(),
    usageCount: 0,
  },
  {
    id: 'weekly-review',
    name: 'Weekly Review',
    title: 'Complete weekly review',
    category: QuestCategory.MAIN,
    subtasks: ['Review completed tasks', 'Plan next week', 'Update goals'],
    createdAt: Date.now(),
    usageCount: 0,
  },
  {
    id: 'code-review',
    name: 'Code Review',
    title: 'Review pull request',
    category: QuestCategory.MAIN,
    subtasks: ['Check code quality', 'Test functionality', 'Leave feedback'],
    createdAt: Date.now(),
    usageCount: 0,
  },
  {
    id: 'morning-routine',
    name: 'Morning Routine',
    title: 'Complete morning routine',
    category: QuestCategory.OPTIONAL,
    subtasks: ['Exercise', 'Breakfast', 'Plan the day'],
    createdAt: Date.now(),
    usageCount: 0,
  },
  {
    id: 'learning-session',
    name: 'Learning Session',
    title: 'Study new topic',
    category: QuestCategory.OPTIONAL,
    subtasks: ['Read documentation', 'Build example project', 'Take notes'],
    createdAt: Date.now(),
    usageCount: 0,
  },
];

export async function loadTemplates(): Promise<QuestTemplate[]> {
  try {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    const customTemplates = stored ? JSON.parse(stored) : [];

    // Merge built-in and custom templates
    return [...BUILTIN_TEMPLATES, ...customTemplates];
  } catch (error) {
    console.error('Failed to load templates:', error);
    return BUILTIN_TEMPLATES;
  }
}

export async function saveTemplate(template: Omit<QuestTemplate, 'id' | 'createdAt' | 'usageCount'>): Promise<QuestTemplate[]> {
  try {
    const templates = await loadCustomTemplates();

    const newTemplate: QuestTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      createdAt: Date.now(),
      usageCount: 0,
    };

    const updatedTemplates = [...templates, newTemplate];
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updatedTemplates));

    return [...BUILTIN_TEMPLATES, ...updatedTemplates];
  } catch (error) {
    console.error('Failed to save template:', error);
    throw error;
  }
}

export async function deleteTemplate(templateId: string): Promise<QuestTemplate[]> {
  try {
    // Don't allow deleting built-in templates
    if (BUILTIN_TEMPLATES.some(t => t.id === templateId)) {
      throw new Error('Cannot delete built-in templates');
    }

    const templates = await loadCustomTemplates();
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updatedTemplates));

    return [...BUILTIN_TEMPLATES, ...updatedTemplates];
  } catch (error) {
    console.error('Failed to delete template:', error);
    throw error;
  }
}

export async function incrementTemplateUsage(templateId: string): Promise<void> {
  try {
    // If it's a built-in template, track usage in a separate key
    if (BUILTIN_TEMPLATES.some(t => t.id === templateId)) {
      const usageKey = `template-usage-${templateId}`;
      const currentUsage = parseInt(localStorage.getItem(usageKey) || '0');
      localStorage.setItem(usageKey, String(currentUsage + 1));
      return;
    }

    // For custom templates, update the template itself
    const templates = await loadCustomTemplates();
    const updatedTemplates = templates.map(t =>
      t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
    );
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updatedTemplates));
  } catch (error) {
    console.error('Failed to increment template usage:', error);
  }
}

async function loadCustomTemplates(): Promise<QuestTemplate[]> {
  try {
    const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load custom templates:', error);
    return [];
  }
}
