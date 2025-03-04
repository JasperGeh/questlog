'use client';

import { useState, useRef } from 'react';
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
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transformedSubtasks, setTransformedSubtasks] = useState<{original: string, transformed: string}[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{title: string, description: string, reward: string} | null>(null);
  const datePickerRef = useRef<HTMLInputElement>(null);
  
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
      // Filter subtasks to only include non-empty ones
      const filteredSubtasks = subtasks.filter(task => task.trim());
      
      // Pass the filtered subtasks for batch transformation
      const epicQuest = await transformToEpicQuest(
        {
          title,
          // Let the AI generate the reward without user input
        },
        filteredSubtasks
      );
      
      // Transform subtasks for preview using the returned transformer
      const transformed = filteredSubtasks.map(task => ({
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
        realLifeReward: 'Task completion', // Default value since we removed the input
        visualReward: previewData.reward,
      };
      
      // Add to storage and update state
      const updatedQuests = addQuest(quest);
      onQuestAdded(updatedQuests);
      
      // Reset form
      setTitle('');
      setCategory(QuestCategory.MAIN);
      setDueDate('');
      setSubtasks([]);
      setShowPreview(false);
      setPreviewData(null);
    } catch (error) {
      console.error('Failed to add quest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleCategory = () => {
    setCategory(category === QuestCategory.MAIN ? QuestCategory.OPTIONAL : QuestCategory.MAIN);
  };
  
  return (
    <div className="mb-10">
      
      <form onSubmit={(e) => { e.preventDefault(); handlePreview(); }} className="space-y-4">
        {/* Main input area - always visible */}
        <div className="flex space-x-2 items-center">
          <button
            type="button"
            onClick={toggleCategory}
            className={`shrink-0 px-3 py-2 rounded-md ${category === QuestCategory.MAIN ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            title={category === QuestCategory.MAIN ? 'Main Quest' : 'Optional Quest'}
          >
            {category === QuestCategory.MAIN ? 'Main' : 'Optional'}
          </button>
          
          <button
            type="button"
            onClick={() => datePickerRef.current?.showPicker()}
            className="shrink-0 px-3 py-2 bg-gray-200 text-gray-700 rounded-md"
            title="Set due date"
          >
            📅
          </button>

          <input
            ref={datePickerRef}
            type="date"
            className="hidden"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <input
            type="text"
            className="fancy-input flex-grow"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you seeking to accomplish?"
            required
          />
          
          <button
            type="button"
            onClick={handlePreview}
            className="fancy-button primary shrink-0"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? '...' : 'Embark'}
          </button>
        </div>
        
        {/* Date display if set */}
        {dueDate && (
          <div className="text-sm text-gray-600">
            Due: {new Date(dueDate).toLocaleDateString()}
            <button 
              className="ml-2 text-red-500"
              onClick={() => setDueDate('')}
              title="Clear date"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Add subtask button */}
        {subtasks.length === 0 ? (
          <button
            type="button"
            onClick={handleAddSubtask}
            className="text-sm flex items-center mt-2 text-blue-600 hover:text-blue-800"
          >
            <span className="mr-1">+</span> Add Quest Steps
          </button>
        ) : (
          <div className="mt-3">
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
        )}
      </form>

      {/* Quest preview section */}
      {showPreview && previewData && (
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Quest Preview</h3>
          <div className="mb-4">
            <h4 className="font-semibold">{previewData.title}</h4>
            <p className="quest-description mt-2">{previewData.description}</p>
            
            {transformedSubtasks.length > 0 && (
              <div className="mt-4">
                <h5 className="font-semibold mb-2">Quest Steps:</h5>
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
          
          <button
            type="button"
            className="fancy-button primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Inscribing...' : 'Accept This Fate'}
          </button>
        </div>
      )}
    </div>
  );
} 