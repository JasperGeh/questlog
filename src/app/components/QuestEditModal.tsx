'use client';

import { useState, useEffect } from 'react';
import { Quest, QuestCategory, SubTask } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface QuestEditModalProps {
  quest: Quest;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedQuest: Quest) => void;
}

export default function QuestEditModal({ quest, isOpen, onClose, onSave }: QuestEditModalProps) {
  const [originalTitle, setOriginalTitle] = useState(quest.originalTitle);
  const [category, setCategory] = useState(quest.category);
  const [dueDate, setDueDate] = useState(
    quest.dueDate ? new Date(quest.dueDate).toISOString().split('T')[0] : ''
  );
  const [subtasks, setSubtasks] = useState<SubTask[]>(quest.subTasks);

  useEffect(() => {
    if (isOpen) {
      setOriginalTitle(quest.originalTitle);
      setCategory(quest.category);
      setDueDate(quest.dueDate ? new Date(quest.dueDate).toISOString().split('T')[0] : '');
      setSubtasks(quest.subTasks);
    }
  }, [isOpen, quest]);

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: uuidv4(), description: '', completed: false }]);
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].description = value;
    setSubtasks(newSubtasks);
  };

  const handleRemoveSubtask = (index: number) => {
    const newSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(newSubtasks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedQuest: Quest = {
      ...quest,
      originalTitle,
      description: originalTitle,
      category,
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      subTasks: subtasks.filter(task => task.description.trim()),
    };

    onSave(updatedQuest);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="quest-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Quest</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-gray-400 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Original Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Quest Name
            </label>
            <input
              type="text"
              className="fancy-input"
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              placeholder="What are you seeking to accomplish?"
              required
            />
            <p className="text-xs text-gray-400 mt-1 italic">
              Note: Editing the quest name will not re-transform the epic title or description
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Quest Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCategory(QuestCategory.MAIN)}
                className={`fancy-button ${category === QuestCategory.MAIN ? 'primary' : 'secondary'} flex-1`}
              >
                Main Quest
              </button>
              <button
                type="button"
                onClick={() => setCategory(QuestCategory.OPTIONAL)}
                className={`fancy-button ${category === QuestCategory.OPTIONAL ? 'primary' : 'secondary'} flex-1`}
              >
                Optional Quest
              </button>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Due Date
            </label>
            <input
              type="date"
              className="fancy-input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            {dueDate && (
              <button
                type="button"
                className="text-sm mt-2 px-3 py-1 bg-[#5a3f3f] text-[#e6e1f0] rounded-md hover:bg-[#724f4f] transition-colors"
                onClick={() => setDueDate('')}
              >
                Clear Date
              </button>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Quest Steps
            </label>
            {subtasks.length > 0 ? (
              <div className="space-y-2 mb-3">
                {subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="flex gap-2">
                    <input
                      type="text"
                      className="fancy-input flex-1"
                      value={subtask.description}
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
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic mb-3">No steps added yet</p>
            )}
            <button
              type="button"
              onClick={handleAddSubtask}
              className="text-sm text-[#e6e1f0] hover:text-white flex items-center"
            >
              <span className="mr-1">+</span> Add Step
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="fancy-button primary flex-1"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="fancy-button secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
