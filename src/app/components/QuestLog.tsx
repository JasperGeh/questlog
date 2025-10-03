'use client';

import { useState, useMemo } from 'react';
import { Quest, QuestCategory } from '../types';
import QuestItem from './QuestItem';
import QuestFilters, { QuestFilterOptions } from './QuestFilters';
import { saveQuests } from '../services/storage';
import { useToast } from '../hooks/useToast';
import { useDebounce } from '../hooks/useDebounce';
import Toast from './Toast';

interface QuestLogProps {
  quests: Quest[];
  onQuestsUpdate: (quests: Quest[]) => void;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  filtersToggleRef?: React.RefObject<HTMLButtonElement>;
  onAction?: (action: any) => void;
}

export default function QuestLog({ quests, onQuestsUpdate, searchInputRef, filtersToggleRef, onAction }: QuestLogProps) {
  const [filters, setFilters] = useState<QuestFilterOptions>({
    search: '',
    category: 'all',
    status: 'all',
    dueDate: 'all',
  });
  const { toasts, removeToast, success } = useToast();

  // Debounce search to avoid filtering on every keystroke
  const debouncedSearch = useDebounce(filters.search, 300);

  // Filter quests based on all filter criteria
  const filteredQuests = useMemo(() => {
    return quests.filter(quest => {
      // Search filter (fuzzy matching on title and description)
      if (debouncedSearch) {
        const searchLower = debouncedSearch.toLowerCase();
        const titleMatch = quest.title.toLowerCase().includes(searchLower);
        const descMatch = quest.originalTitle.toLowerCase().includes(searchLower);
        const epicDescMatch = quest.epicDescription.toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch && !epicDescMatch) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'all' && quest.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status === 'active' && quest.completed) {
        return false;
      }
      if (filters.status === 'completed' && !quest.completed) {
        return false;
      }

      // Due date filter
      if (filters.dueDate !== 'all') {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (filters.dueDate === 'none') {
          if (quest.dueDate) return false;
        } else if (filters.dueDate === 'overdue') {
          if (!quest.dueDate || quest.completed) return false;
          const dueDate = new Date(quest.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate >= now) return false;
        } else if (filters.dueDate === 'today') {
          if (!quest.dueDate) return false;
          const dueDate = new Date(quest.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate.getTime() !== now.getTime()) return false;
        } else if (filters.dueDate === 'week') {
          if (!quest.dueDate) return false;
          const dueDate = new Date(quest.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          const weekFromNow = new Date(now);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          if (dueDate < now || dueDate > weekFromNow) return false;
        }
      }

      return true;
    });
  }, [quests, debouncedSearch, filters.category, filters.status, filters.dueDate]);
  
  // Group quests by category for display
  const questsByCategory = filteredQuests.reduce((acc, quest) => {
    const category = quest.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(quest);
    return acc;
  }, {} as Record<QuestCategory, Quest[]>);
  
  // Sort categories for display
  const sortedCategories = [
    QuestCategory.MAIN,
    QuestCategory.OPTIONAL
  ].filter(category => questsByCategory[category]?.length > 0);

  const activeCount = quests.filter(q => !q.completed).length;
  const completedCount = quests.filter(q => q.completed).length;

  const handleClearCompleted = async () => {
    if (completedCount === 0) return;

    if (confirm(`Clear all ${completedCount} completed quests? This action cannot be undone.`)) {
      const deletedQuests = quests.filter(q => q.completed);
      const activeQuests = quests.filter(q => !q.completed);

      // Record action for undo
      onAction?.({
        type: 'clear_completed',
        data: { deletedQuests },
        timestamp: Date.now(),
      });

      await saveQuests(activeQuests);
      onQuestsUpdate(activeQuests);
      success('The completed chronicles have been sealed away...');
    }
  };

  return (
    <div>
      {/* Filters */}
      <QuestFilters
        filters={filters}
        onFilterChange={setFilters}
        activeCount={activeCount}
        searchInputRef={searchInputRef}
        filtersToggleRef={filtersToggleRef}
      />

      {/* Clear Completed Button */}
      {completedCount > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleClearCompleted}
            className="text-sm px-4 py-2 bg-[#5a3f3f] text-[#e6e1f0] rounded-md hover:bg-[#724f4f] transition-colors"
          >
            Clear All Completed ({completedCount})
          </button>
        </div>
      )}

      {/* Quest List */}
      <div className="quest-card">
        {filteredQuests.length === 0 ? (
          <div className="text-center py-8 italic text-gray-500">
            {quests.length === 0
              ? 'Search a new destiny, aimless wanderer.'
              : 'No quests match thy search. Adjust thy filters, wanderer.'}
          </div>
        ) : (
          <div>
            {/* Always group by category */}
            {sortedCategories.map(category => (
              <div key={category} className="mb-8">
                <h3 className="mb-4 font-bold text-lg border-b pb-2 border-gray-300">
                  {category === QuestCategory.MAIN ? 'Main Quests' : 'Optional Quests'}
                </h3>

                <div>
                  {questsByCategory[category].map(quest => (
                    <QuestItem
                      key={quest.id}
                      quest={quest}
                      onQuestUpdate={onQuestsUpdate}
                      onAction={onAction}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
} 