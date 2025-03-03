'use client';

import { useState, useEffect } from 'react';
import { Quest, QuestCategory } from '../types';
import { loadQuests } from '../services/questStorage';
import QuestItem from './QuestItem';

interface QuestLogProps {
  quests: Quest[];
  onQuestsUpdate: (quests: Quest[]) => void;
}

export default function QuestLog({ quests, onQuestsUpdate }: QuestLogProps) {
  const [activeTab, setActiveTab] = useState<'all' | QuestCategory>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Filter quests based on selected tab and completion status
  const filteredQuests = quests.filter(quest => {
    // Filter by completion status
    if (!showCompleted && quest.completed) {
      return false;
    }
    
    // Filter by category
    if (activeTab !== 'all' && quest.category !== activeTab) {
      return false;
    }
    
    return true;
  });
  
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
    QuestCategory.DAILY,
    QuestCategory.MAIN,
    QuestCategory.OPTIONAL
  ].filter(category => questsByCategory[category]?.length > 0);
  
  return (
    <div className="quest-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="quest-title text-xl">Quest Log</h2>
        
        <div className="flex items-center">
          <label className="inline-flex items-center mr-4 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={() => setShowCompleted(!showCompleted)}
              className="mr-2"
            />
            <span>Show Completed</span>
          </label>
        </div>
      </div>
      
      <div className="mb-6 border-b border-gray-200">
        <div className="flex">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'all' ? 'border-b-2 border-amber-500' : ''
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Quests
          </button>
          
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === QuestCategory.DAILY ? 'border-b-2 border-amber-500' : ''
            }`}
            onClick={() => setActiveTab(QuestCategory.DAILY)}
          >
            Daily
          </button>
          
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === QuestCategory.MAIN ? 'border-b-2 border-amber-500' : ''
            }`}
            onClick={() => setActiveTab(QuestCategory.MAIN)}
          >
            Main
          </button>
          
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === QuestCategory.OPTIONAL ? 'border-b-2 border-amber-500' : ''
            }`}
            onClick={() => setActiveTab(QuestCategory.OPTIONAL)}
          >
            Optional
          </button>
        </div>
      </div>
      
      {filteredQuests.length === 0 ? (
        <div className="text-center py-8 italic text-gray-500">
          No quests available. Embark on a new adventure!
        </div>
      ) : (
        <div>
          {/* When "All" tab is active, group by category */}
          {activeTab === 'all' ? (
            sortedCategories.map(category => (
              <div key={category} className="mb-8">
                <h3 className="mb-4 font-bold text-lg border-b pb-2 border-gray-300">
                  {category === QuestCategory.DAILY ? 'Daily Quests' : 
                   category === QuestCategory.MAIN ? 'Main Quests' : 
                   'Optional Quests'}
                </h3>
                
                <div>
                  {questsByCategory[category].map(quest => (
                    <QuestItem
                      key={quest.id}
                      quest={quest}
                      onQuestUpdate={onQuestsUpdate}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // When a specific category tab is active
            <div>
              {filteredQuests.map(quest => (
                <QuestItem
                  key={quest.id}
                  quest={quest}
                  onQuestUpdate={onQuestsUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 