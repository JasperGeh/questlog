'use client';

import { useState, memo } from 'react';
import { Quest } from '../types';
import { toggleQuestCompletion, toggleSubtaskCompletion, deleteQuest, updateQuest } from '../services/storage';
import Image from 'next/image';
import QuestEditModal from './QuestEditModal';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

interface QuestItemProps {
  quest: Quest;
  onQuestUpdate: (updatedQuests: Quest[]) => void;
}

function QuestItem({ quest, onQuestUpdate }: QuestItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toasts, removeToast, success } = useToast();

  const handleQuestCompletion = async () => {
    const updatedQuests = await toggleQuestCompletion(quest.id);
    onQuestUpdate(updatedQuests);
    if (!quest.completed) {
      success('Quest completed! The triumph echoes through eternity...');
    }
  };

  const handleQuestAbandonment = async () => {
    if (confirm('Are you sure you wish to abandon this quest? This action cannot be undone.')) {
      const updatedQuests = await deleteQuest(quest.id);
      onQuestUpdate(updatedQuests);
      success('Quest abandoned. Its memory fades into shadow...');
    }
  };

  const handleSubtaskCompletion = async (subtaskId: string) => {
    const updatedQuests = await toggleSubtaskCompletion(quest.id, subtaskId);
    onQuestUpdate(updatedQuests);
  };

  const handleEditSave = async (updatedQuest: Quest) => {
    const updatedQuests = await updateQuest(updatedQuest);
    onQuestUpdate(updatedQuests);
    success('Quest updated. The chronicle has been rewritten...');
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
            loading="lazy"
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
            onClick={() => setIsEditModalOpen(true)}
            className="quest-button"
            title="Edit quest details"
          >
            Edit Quest
          </button>
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

      {/* Edit Modal */}
      <QuestEditModal
        quest={quest}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
      />

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

// Memoize to prevent unnecessary re-renders when other quests change
export default memo(QuestItem, (prevProps, nextProps) => {
  // Only re-render if the quest itself changed
  return prevProps.quest.id === nextProps.quest.id &&
         JSON.stringify(prevProps.quest) === JSON.stringify(nextProps.quest);
}); 