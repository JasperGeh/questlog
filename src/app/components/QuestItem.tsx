'use client';

import { useState } from 'react';
import { Quest, SubTask } from '../types';
import { toggleQuestCompletion, toggleSubtaskCompletion, deleteQuest } from '../services/questStorage';

interface QuestItemProps {
  quest: Quest;
  onQuestUpdate: (updatedQuests: Quest[]) => void;
}

export default function QuestItem({ quest, onQuestUpdate }: QuestItemProps) {
  const [expanded, setExpanded] = useState(false);
  
  const handleQuestCompletion = () => {
    const updatedQuests = toggleQuestCompletion(quest.id);
    onQuestUpdate(updatedQuests);
  };
  
  const handleQuestAbandonment = () => {
    if (confirm('Are you sure you wish to abandon this quest? This action cannot be undone.')) {
      const updatedQuests = deleteQuest(quest.id);
      onQuestUpdate(updatedQuests);
    }
  };
  
  const handleSubtaskCompletion = (subtaskId: string) => {
    const updatedQuests = toggleSubtaskCompletion(quest.id, subtaskId);
    onQuestUpdate(updatedQuests);
  };
  
  // Calculate completion percentage for the progress bar
  const completionPercentage = quest.subTasks.length 
    ? Math.round((quest.subTasks.filter(t => t.completed).length / quest.subTasks.length) * 100)
    : quest.completed ? 100 : 0;
  
  return (
    <div className={`quest-card ${quest.category} mb-6`}>
      <div>
        <div>
          <h3 className={`quest-title ${quest.completed ? 'completed' : ''}`}>
            {quest.title}
          </h3>
          <p className={`quest-description ${quest.completed ? 'completed' : ''}`}>
            {quest.epicDescription}
          </p>
          
          {/* Progress bar */}
          {quest.subTasks.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-600" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {quest.subTasks.length > 0 && (
            <div className="mt-4">
              <div 
                className="flex items-center cursor-pointer" 
                onClick={() => setExpanded(!expanded)}
              >
                <span className="text-sm mr-2">{expanded ? '▼' : '►'}</span>
                <span className="font-semibold">
                  Quest Steps ({quest.subTasks.filter(t => t.completed).length}/{quest.subTasks.length})
                </span>
              </div>
              
              {expanded && (
                <div className="ml-6 mt-2 space-y-2">
                  {quest.subTasks.map(subtask => (
                    <div key={subtask.id} className="quest-subtask">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleSubtaskCompletion(subtask.id)}
                        className="subtask-checkbox"
                      />
                      <span className={`quest-description text-sm ${subtask.completed ? 'completed' : ''}`}>
                        {subtask.description}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="quest-reward mt-4">
            <span className="text-sm font-semibold">Reward: </span> 
            {quest.visualReward}
          </div>
          
          <div className="text-xs mt-3 text-gray-500">
            {quest.dueDate ? (
              <span>Complete by: {new Date(quest.dueDate).toLocaleDateString()}</span>
            ) : null}
          </div>

          {/* Quest action buttons */}
          <div className="mt-5 flex justify-center gap-4">
            <button 
              onClick={handleQuestCompletion}
              className={`fancy-button ${quest.completed ? 'secondary' : 'primary'} w-1/3`}
            >
              {quest.completed ? 'Reopen Quest' : 'Complete Quest'}
            </button>
            <button 
              onClick={handleQuestAbandonment}
              className="fancy-button danger w-1/3"
            >
              Abandon Quest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 