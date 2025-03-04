'use client';

import { useState } from 'react';
import { Quest, QuestCategory } from '../types';
import QuestItem from './QuestItem';

interface QuestLogProps {
  quests: Quest[];
  onQuestsUpdate: (quests: Quest[]) => void;
}

export default function QuestLog({ quests, onQuestsUpdate }: QuestLogProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Filter quests based on completion status
  const filteredQuests = quests.filter(quest => {
    // Only filter by completion status
    return showCompleted || !quest.completed;
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
    QuestCategory.MAIN,
    QuestCategory.OPTIONAL
  ].filter(category => questsByCategory[category]?.length > 0);
  
  return (
    <div className="quest-card">
      <div className="flex justify-end mb-6">
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
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
      
      {filteredQuests.length === 0 ? (
        <div className="text-center py-8 italic text-gray-500">
          Search a new destiny, aimless wanderer.
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
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 