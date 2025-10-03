'use client';

import { useState } from 'react';
import { QuestCategory } from '../types';

export interface QuestFilterOptions {
  search: string;
  category: 'all' | QuestCategory;
  status: 'all' | 'active' | 'completed';
  dueDate: 'all' | 'overdue' | 'today' | 'week' | 'none';
}

interface QuestFiltersProps {
  filters: QuestFilterOptions;
  onFilterChange: (filters: QuestFilterOptions) => void;
  activeCount: number;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  filtersToggleRef?: React.RefObject<HTMLButtonElement>;
}

export default function QuestFilters({ filters, onFilterChange, activeCount, searchInputRef, filtersToggleRef }: QuestFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const handleCategoryChange = (category: 'all' | QuestCategory) => {
    onFilterChange({ ...filters, category });
  };

  const handleStatusChange = (status: 'all' | 'active' | 'completed') => {
    onFilterChange({ ...filters, status });
  };

  const handleDueDateChange = (dueDate: 'all' | 'overdue' | 'today' | 'week' | 'none') => {
    onFilterChange({ ...filters, dueDate });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: 'all',
      status: 'all',
      dueDate: 'all',
    });
    setIsExpanded(false);
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.dueDate !== 'all';

  return (
    <div className="quest-card mb-6">
      {/* Search Bar - Always Visible */}
      <div className="mb-4">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search thy quests..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="fancy-input pr-10"
          />
          {filters.search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <button
          ref={filtersToggleRef}
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm px-4 py-2 bg-[#3d3554] text-[#e6e1f0] rounded-md hover:bg-[#4d4467] transition-colors"
        >
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && !isExpanded && (
            <span className="ml-2 px-2 py-0.5 bg-[#8a7f55] rounded-full text-xs">
              Active
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm px-4 py-2 bg-[#5a3f3f] text-[#e6e1f0] rounded-md hover:bg-[#724f4f] transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-[#3d3554]">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2">Quest Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`quest-button ${filters.category === 'all' ? 'primary' : 'secondary'}`}
              >
                All
              </button>
              <button
                onClick={() => handleCategoryChange(QuestCategory.MAIN)}
                className={`quest-button ${filters.category === QuestCategory.MAIN ? 'primary' : 'secondary'}`}
              >
                Main
              </button>
              <button
                onClick={() => handleCategoryChange(QuestCategory.OPTIONAL)}
                className={`quest-button ${filters.category === QuestCategory.OPTIONAL ? 'primary' : 'secondary'}`}
              >
                Optional
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleStatusChange('all')}
                className={`quest-button ${filters.status === 'all' ? 'primary' : 'secondary'}`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusChange('active')}
                className={`quest-button ${filters.status === 'active' ? 'primary' : 'secondary'}`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => handleStatusChange('completed')}
                className={`quest-button ${filters.status === 'completed' ? 'primary' : 'secondary'}`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Due Date Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2">Due Date</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button
                onClick={() => handleDueDateChange('all')}
                className={`quest-button ${filters.dueDate === 'all' ? 'primary' : 'secondary'}`}
              >
                All
              </button>
              <button
                onClick={() => handleDueDateChange('overdue')}
                className={`quest-button ${filters.dueDate === 'overdue' ? 'primary' : 'secondary'}`}
              >
                Overdue
              </button>
              <button
                onClick={() => handleDueDateChange('today')}
                className={`quest-button ${filters.dueDate === 'today' ? 'primary' : 'secondary'}`}
              >
                Today
              </button>
              <button
                onClick={() => handleDueDateChange('week')}
                className={`quest-button ${filters.dueDate === 'week' ? 'primary' : 'secondary'}`}
              >
                This Week
              </button>
              <button
                onClick={() => handleDueDateChange('none')}
                className={`quest-button ${filters.dueDate === 'none' ? 'primary' : 'secondary'}`}
              >
                No Due Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
