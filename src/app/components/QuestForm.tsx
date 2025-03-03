'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Quest, QuestCategory, SubTask } from '../types';
import { addQuest } from '../services/questStorage';
import { transformToEpicQuest } from '../services/epicTransformer';

interface QuestFormProps {
  onQuestAdded: (quests: Quest[]) => void;
}

export default function QuestForm({ onQuestAdded }: QuestFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<QuestCategory>(QuestCategory.MAIN);
  const [reward, setReward] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transformedSubtasks, setTransformedSubtasks] = useState<{original: string, transformed: string}[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{title: string, description: string, reward: string} | null>(null);
  
  const handleAddSubtask = () => {
    setSubtasks([...subtasks, '']);
  };
  
  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };
  
  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(newSubtasks);
  };
  
  const handlePreview = async () => {
    if (!title.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const epicQuest = await transformToEpicQuest({
        title,
        reward,
      });
      
      // Transform subtasks for preview
      const transformed = subtasks
        .filter(task => task.trim())
        .map(task => ({
          original: task,
          transformed: epicQuest.subtaskTransformer(task)
        }));
      
      setTransformedSubtasks(transformed);
      setPreviewData({
        title: epicQuest.epicTitle,
        description: epicQuest.epicDescription,
        reward: epicQuest.epicReward
      });
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to transform quest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    if (!showPreview) {
      handlePreview();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use existing preview data
      if (!previewData) {
        return;
      }
      
      // Filter out empty subtasks and transform them
      const filteredSubtasks = subtasks
        .filter(task => task.trim())
        .map((task, index) => ({
          id: uuidv4(),
          description: transformedSubtasks[index].transformed,
          completed: false,
        }));
      
      // Create the quest
      const quest: Quest = {
        id: uuidv4(),
        title: previewData.title,
        originalTitle: title,
        description: title,
        epicDescription: previewData.description,
        category,
        completed: false,
        createdAt: Date.now(),
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        subTasks: filteredSubtasks,
        realLifeReward: reward,
        visualReward: previewData.reward,
      };
      
      // Add to storage and update state
      const updatedQuests = addQuest(quest);
      onQuestAdded(updatedQuests);
      
      // Reset form
      setTitle('');
      setCategory(QuestCategory.MAIN);
      setReward('');
      setDueDate('');
      setSubtasks(['']);
      setShowPreview(false);
      setPreviewData(null);
    } catch (error) {
      console.error('Failed to add quest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="quest-card mb-8">
      <h2 className="quest-title text-xl mb-4">
        {showPreview ? 'Behold Thy Quest' : 'Embark on a New Quest'}
      </h2>
      
      {showPreview && previewData ? (
        <div className="mb-6">
          <div className="mb-4">
            <h3 className="font-semibold text-lg">{previewData.title}</h3>
            <p className="quest-description mt-2">{previewData.description}</p>
            
            {transformedSubtasks.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Quest Steps:</h4>
                <ul className="ml-4 space-y-2">
                  {transformedSubtasks.map((task, i) => (
                    <li key={i} className="list-disc ml-2">
                      {task.transformed}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="quest-reward mt-4">
              <span className="text-sm font-semibold">Reward: </span> 
              {previewData.reward}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              className="fancy-button secondary"
              onClick={() => setShowPreview(false)}
            >
              Return to Editing
            </button>
            
            <button
              type="button"
              className="fancy-button primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Inscribing...' : 'Accept This Fate'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block mb-2">
              Task *
            </label>
            <input
              id="title"
              type="text"
              className="fancy-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter thy task"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="category" className="block mb-2">
              Quest Category
            </label>
            <select
              id="category"
              className="fancy-input"
              value={category}
              onChange={(e) => setCategory(e.target.value as QuestCategory)}
            >
              <option value={QuestCategory.MAIN}>Main Quest</option>
              <option value={QuestCategory.DAILY}>Daily Quest</option>
              <option value={QuestCategory.OPTIONAL}>Optional Quest</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="reward" className="block mb-2">
              Real-life Reward (optional)
            </label>
            <input
              id="reward"
              type="text"
              className="fancy-input"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="What shalt thou gain from this quest?"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="dueDate" className="block mb-2">
              Complete By (optional)
            </label>
            <input
              id="dueDate"
              type="date"
              className="fancy-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">
              Quest Steps
            </label>
            
            {subtasks.map((subtask, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  className="fancy-input mr-2"
                  value={subtask}
                  onChange={(e) => handleSubtaskChange(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
                
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                  aria-label="Remove step"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={handleAddSubtask}
              className="text-sm flex items-center mt-2 text-blue-600 hover:text-blue-800"
            >
              <span className="mr-1">+</span> Add Another Step
            </button>
          </div>
          
          <button
            type="button"
            onClick={handlePreview}
            className="fancy-button primary"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? 'Consulting the Ancients...' : 'Glimpse Thy Fate'}
          </button>
        </form>
      )}
    </div>
  );
} 