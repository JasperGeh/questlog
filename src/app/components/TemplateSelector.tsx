'use client';

import { useState, useEffect } from 'react';
import { QuestTemplate } from '../types';
import { loadTemplates, incrementTemplateUsage } from '../services/templateStorage';

interface TemplateSelectorProps {
  onSelectTemplate: (template: QuestTemplate) => void;
  onClose: () => void;
}

export default function TemplateSelector({ onSelectTemplate, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<QuestTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      const loadedTemplates = await loadTemplates();
      setTemplates(loadedTemplates);
      setIsLoading(false);
    }
    fetchTemplates();
  }, []);

  const handleSelect = async (template: QuestTemplate) => {
    await incrementTemplateUsage(template.id);
    onSelectTemplate(template);
    onClose();
  };

  // Group templates by built-in vs custom
  const builtInTemplates = templates.filter(t => !t.id.startsWith('custom-'));
  const customTemplates = templates.filter(t => t.id.startsWith('custom-'));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="quest-card max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Quest Templates</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-gray-400 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-sm italic text-gray-400 mb-6">
          Choose from ancient scrolls to begin thy quest with haste...
        </p>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-lg italic">Loading templates...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Built-in Templates */}
            {builtInTemplates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#e6e1f0] border-b border-[#3d3554] pb-2">
                  Ancient Scrolls
                </h3>
                <div className="grid gap-3">
                  {builtInTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className="text-left p-4 bg-[#2a233c] border border-[#3d3554] rounded-md hover:bg-[#3d3554] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-[#e6e1f0]">{template.name}</h4>
                        <span className="text-xs px-2 py-1 bg-[#4f7259] text-[#e6e1f0] rounded">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-sm text-[#bbb6c7] mb-2">{template.title}</p>
                      {template.subtasks.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {template.subtasks.length} steps
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Templates */}
            {customTemplates.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-[#e6e1f0] border-b border-[#3d3554] pb-2">
                  Thy Personal Chronicles
                </h3>
                <div className="grid gap-3">
                  {customTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template)}
                      className="text-left p-4 bg-[#2a233c] border border-[#3d3554] rounded-md hover:bg-[#3d3554] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-[#e6e1f0]">{template.name}</h4>
                        <span className="text-xs px-2 py-1 bg-[#4f7259] text-[#e6e1f0] rounded">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-sm text-[#bbb6c7] mb-2">{template.title}</p>
                      {template.subtasks.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {template.subtasks.length} steps • Used {template.usageCount} times
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {templates.length === 0 && (
              <div className="text-center py-8 text-gray-500 italic">
                No templates available. Create your first quest to save it as a template!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
