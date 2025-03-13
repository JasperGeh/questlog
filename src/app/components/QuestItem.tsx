'use client';

import { Quest } from '../types';
import { toggleQuestCompletion, toggleSubtaskCompletion, deleteQuest } from '../services/questStorage';
import Image from 'next/image';

interface QuestItemProps {
  quest: Quest;
  onQuestUpdate: (updatedQuests: Quest[]) => void;
}

export default function QuestItem({ quest, onQuestUpdate }: QuestItemProps) {
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
  
  // Format the date for display
  const formattedDate = quest.dueDate 
    ? new Date(quest.dueDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  return (
    <div className="quest-card-new">
      {/* Left column with image and description */}
      <div className="quest-left-column">
        {/* Image and title */}
        <div className="quest-image-container">
          <Image
            src="/header.png"
            alt={quest.title}
            width={1792}
            height={1024}
            className="quest-image"
            priority
          />
          
          {/* Only show COMPLETED badge, not FAILED */}
          {quest.completed && (
            <div className="quest-status-badge">
              COMPLETED
            </div>
          )}
          
          {/* Due date badge - show in top left */}
          {formattedDate && (
            <div className="quest-date-badge">
              {quest.completed ? 'Completed:' : 'Due:'} {formattedDate}
            </div>
          )}
          
          <div className="quest-image-overlay">
            <h3 className="quest-title-new">
              {quest.title}
            </h3>
            <p className="quest-subtitle">
              {quest.description}
            </p>
          </div>
        </div>
        
        {/* Description below the image in left column */}
        <div className="quest-description-new">
          {quest.epicDescription}
        </div>
      </div>
      
      {/* Right column with tasks and reward */}
      <div className="quest-content">
        {/* Tasks section */}
        {quest.subTasks.length > 0 && (
          <div className="quest-tasks">
            <ul className="quest-task-list">
              {quest.subTasks.map((subtask) => (
                <li 
                  key={subtask.id} 
                  className={`quest-task-item ${subtask.completed ? 'completed' : ''}`}
                  onClick={() => handleSubtaskCompletion(subtask.id)}
                >
                  {/* Use hollow diamond for all non-completed tasks */}
                  {subtask.completed ? (
                    <span className="quest-task-marker">
                      ◆
                    </span>
                  ) : (
                    <span className="quest-task-marker">
                      ◇
                    </span>
                  )}
                  <span className="quest-task-description">{subtask.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Reward section */}
        <div className="quest-reward-new">
          <p className="quest-reward-text">
            <span className="font-semibold">Reward: </span>
            {quest.visualReward}
          </p>
        </div>

        {/* Action buttons moved below reward in right column */}
        <div className="quest-actions">
          <button 
            onClick={handleQuestCompletion}
            className={`quest-button ${quest.completed ? '' : 'complete'}`}
          >
            {quest.completed ? 'Reopen Quest' : 'Complete Quest'}
          </button>
          <button 
            onClick={handleQuestAbandonment}
            className="quest-button abandon"
          >
            Abandon Quest
          </button>
        </div>
      </div>
    </div>
  );
} 