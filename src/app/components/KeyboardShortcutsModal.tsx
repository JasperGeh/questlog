'use client';

import { getModifierKey } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const mod = getModifierKey();

  const shortcuts = [
    { keys: `${mod} + N`, description: 'Create new quest' },
    { keys: `${mod} + F`, description: 'Focus search' },
    { keys: `${mod} + K`, description: 'Toggle filters' },
    { keys: '/', description: 'Quick search' },
    { keys: 'Esc', description: 'Clear search / Close modals' },
    { keys: '?', description: 'Show this help' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="quest-card max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-gray-400 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-sm italic text-gray-400 mb-6">
          Master these arcane commands to navigate the realm with swiftness...
        </p>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-3 border-b border-[#3d3554] last:border-b-0"
            >
              <span className="text-[#e6e1f0]">{shortcut.description}</span>
              <kbd className="px-3 py-1 bg-[#2a233c] border border-[#3d3554] rounded text-sm font-mono text-[#d4af37]">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-[#3d3554]">
          <p className="text-xs text-gray-500 text-center italic">
            Press <kbd className="px-2 py-1 bg-[#2a233c] border border-[#3d3554] rounded text-xs">?</kbd> at any time to view these shortcuts
          </p>
        </div>
      </div>
    </div>
  );
}
