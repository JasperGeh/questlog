'use client';

import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Quest, QuestCategory } from '../types';
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
            className={`quest-button shrink-0 ${category === QuestCategory.MAIN ? 'primary' : 'secondary'}`}
            title={category === QuestCategory.MAIN ? 'Main Quest' : 'Optional Quest'}
          >
            {category === QuestCategory.MAIN ? 'Main' : 'Optional'}
          </button>
          
          <button
            type="button"
            onClick={() => datePickerRef.current?.showPicker()}
            className="quest-button shrink-0"
            title="Set due date"
          >
            Add Date
          </button>

          <button
            type="button"
            onClick={handleAddSubtask}
            className="quest-button shrink-0"
            title="Add steps to your quest"
          >
            Add Subtasks
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
            className="quest-button shrink-0"
            disabled={isSubmitting || !title.trim()}
          >
            {isSubmitting ? '...' : 'Embark'}
          </button>
        </div>
        
        {/* Date display if set */}
        {dueDate && (
          <div className="text-sm text-[#e6e1f0]">
            Due: {new Date(dueDate).toLocaleDateString()}
            <button 
              className="ml-2 px-2 py-1 bg-[#5a3f3f] text-[#e6e1f0] rounded-md hover:bg-[#724f4f] transition-colors"
              onClick={() => setDueDate('')}
              title="Clear date"
            >
              ✕
            </button>
          </div>
        )}
        
        {/* Subtasks section - only show when there are subtasks */}
        {subtasks.length > 0 && (
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
                  className="px-3 py-2 bg-[#5a3f3f] text-[#e6e1f0] rounded-md hover:bg-[#724f4f] transition-colors"
                  aria-label="Remove step"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={handleAddSubtask}
              className="text-sm flex items-center mt-2 text-[#e6e1f0] hover:text-white"
            >
              <span className="mr-1">+</span> Add Another Step
            </button>
          </div>
        )}
      </form>

      {/* Quest preview section */}
      {showPreview && previewData && (
        <div className="mt-6 p-4 border border-[#3d3554] rounded-md bg-[#1a1625] text-[#e6e1f0]">
          <h3 className="text-lg font-semibold mb-2 text-[#e6e1f0]">Quest Preview</h3>
          <div className="mb-4">
            <h4 className="font-semibold text-[#e6e1f0]">{previewData.title}</h4>
            <p className="quest-description mt-2 text-[#bbb6c7]">{previewData.description}</p>
            
            {transformedSubtasks.length > 0 && (
              <div className="mt-4">
                <h5 className="font-semibold mb-2 text-[#e6e1f0]">Quest Steps:</h5>
                <ul className="ml-4 space-y-2 text-[#bbb6c7]">
                  {transformedSubtasks.map((task, i) => (
                    <li key={i} className="list-disc ml-2">
                      {task.transformed}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="quest-reward mt-4 text-[#e6e1f0]">
              <span className="text-sm font-semibold">Reward: </span> 
              {previewData.reward}
            </div>
          </div>
          
          <button
            type="button"
            className="quest-button"
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