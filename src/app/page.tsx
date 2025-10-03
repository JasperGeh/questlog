'use client';

import { useState, useEffect, useRef } from 'react';
import { Quest } from './types';
import { loadQuests, performMigrationIfNeeded, saveQuests } from './services/storage';
import QuestForm from './components/QuestForm';
import QuestLog from './components/QuestLog';
import QuestStats from './components/QuestStats';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useUndoRedo, Action } from './hooks/useUndoRedo';
import { useToast } from './hooks/useToast';

export default function Home() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Refs for focusing elements
  const questInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersToggleRef = useRef<HTMLButtonElement>(null);

  // Undo/Redo functionality
  const { addAction, undo, redo, canUndo, canRedo } = useUndoRedo();
  const { success, info } = useToast();

  // Load quests and perform migration if needed
  useEffect(() => {
    async function initializeStorage() {
      try {
        // Try to migrate from localStorage to IndexedDB
        const migrationResult = await performMigrationIfNeeded();

        if (migrationResult.migrated) {
          setMigrationStatus('Data migrated to IndexedDB successfully!');
          setTimeout(() => setMigrationStatus(null), 5000);
        }

        // Load quests from storage (either IndexedDB or localStorage)
        const storedQuests = await loadQuests();
        setQuests(storedQuests);
      } catch (error) {
        console.error('Failed to initialize storage:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeStorage();
  }, []);

  const activeCount = quests.filter(q => !q.completed).length;
  const completedCount = quests.filter(q => q.completed).length;

  // Undo/Redo handlers
  const handleUndo = async () => {
    const action = undo();
    if (!action) return;

    let newQuests: Quest[] = [];

    switch (action.type) {
      case 'add':
        // Undo add: remove the quest
        newQuests = quests.filter(q => q.id !== action.data.quest.id);
        info('Quest creation undone');
        break;
      case 'delete':
        // Undo delete: restore the quest
        newQuests = [...quests, action.data.quest];
        info('Quest deletion undone');
        break;
      case 'complete':
        // Undo complete: mark as incomplete
        newQuests = quests.map(q =>
          q.id === action.data.questId ? { ...q, completed: false } : q
        );
        info('Quest completion undone');
        break;
      case 'uncomplete':
        // Undo uncomplete: mark as complete
        newQuests = quests.map(q =>
          q.id === action.data.questId ? { ...q, completed: true } : q
        );
        info('Quest restored to completed');
        break;
      case 'update':
        // Undo update: restore previous state
        newQuests = quests.map(q =>
          q.id === action.data.previousQuest.id ? action.data.previousQuest : q
        );
        info('Quest changes undone');
        break;
      case 'clear_completed':
        // Undo clear completed: restore all deleted quests
        newQuests = [...quests, ...action.data.deletedQuests];
        info('Cleared quests restored');
        break;
    }

    setQuests(newQuests);
    await saveQuests(newQuests);
  };

  const handleRedo = async () => {
    const action = redo();
    if (!action) return;

    let newQuests: Quest[] = [];

    switch (action.type) {
      case 'add':
        // Redo add: add the quest back
        newQuests = [...quests, action.data.quest];
        info('Quest creation redone');
        break;
      case 'delete':
        // Redo delete: remove the quest again
        newQuests = quests.filter(q => q.id !== action.data.quest.id);
        info('Quest deletion redone');
        break;
      case 'complete':
        // Redo complete: mark as complete
        newQuests = quests.map(q =>
          q.id === action.data.questId ? { ...q, completed: true } : q
        );
        info('Quest completion redone');
        break;
      case 'uncomplete':
        // Redo uncomplete: mark as incomplete
        newQuests = quests.map(q =>
          q.id === action.data.questId ? { ...q, completed: false } : q
        );
        info('Quest uncomplete redone');
        break;
      case 'update':
        // Redo update: apply the new state
        newQuests = quests.map(q =>
          q.id === action.data.newQuest.id ? action.data.newQuest : q
        );
        info('Quest changes redone');
        break;
      case 'clear_completed':
        // Redo clear completed: remove completed quests again
        newQuests = quests.filter(q => !q.completed);
        info('Completed quests cleared again');
        break;
    }

    setQuests(newQuests);
    await saveQuests(newQuests);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'z',
      ctrl: true,
      description: 'Undo last action',
      callback: (e) => {
        if (canUndo) {
          e.preventDefault();
          handleUndo();
        }
      },
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      description: 'Redo last action',
      callback: (e) => {
        if (canRedo) {
          e.preventDefault();
          handleRedo();
        }
      },
    },
    {
      key: 'n',
      ctrl: true,
      description: 'Create new quest',
      callback: () => {
        questInputRef.current?.focus();
        questInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Focus search',
      callback: () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Toggle filters',
      callback: () => {
        filtersToggleRef.current?.click();
      },
    },
    {
      key: '/',
      description: 'Quick search',
      callback: () => {
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    },
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      callback: () => {
        setShowShortcutsModal(true);
      },
    },
    {
      key: 'Escape',
      description: 'Close modals',
      callback: () => {
        setShowShortcutsModal(false);
      },
    },
  ]);

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Migration Status Banner */}
      {migrationStatus && (
        <div className="mb-6 p-4 bg-[#3f5a45] border-2 border-[#4f7259] rounded-md text-center">
          <p className="text-sm italic text-[#e6e1f0]">{migrationStatus}</p>
        </div>
      )}

      <header className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className="text-4xl font-bold">Quest Log</h1>
          {quests.length > 0 && (
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-[#4f7259] text-[#e6e1f0] rounded-full text-sm font-semibold">
                {activeCount} Active
              </span>
              {completedCount > 0 && (
                <span className="px-3 py-1 bg-[#3d3554] text-[#e6e1f0] rounded-full text-sm font-semibold">
                  {completedCount} Complete
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="mt-4 text-sm px-4 py-2 bg-[#3d3554] text-[#e6e1f0] rounded-md hover:bg-[#4d4467] transition-colors"
        >
          {showStats ? 'Hide Chronicle' : 'View Chronicle of Deeds'}
        </button>
      </header>

      <div className="space-y-10">
        {/* Statistics Dashboard */}
        {showStats && !isLoading && (
          <ErrorBoundary>
            <section>
              <QuestStats quests={quests} />
            </section>
          </ErrorBoundary>
        )}

        {/* New Quest Form */}
        <ErrorBoundary>
          <section>
            <QuestForm
              inputRef={questInputRef}
              onQuestAdded={(updatedQuests, quest) => {
                setQuests(updatedQuests);
                addAction({
                  type: 'add',
                  data: { quest },
                  timestamp: Date.now(),
                });
              }}
            />
          </section>
        </ErrorBoundary>

        {/* Quest Log */}
        <ErrorBoundary>
          <section>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-xl italic">Loading thy quest log...</p>
              </div>
            ) : (
              <QuestLog
                quests={quests}
                searchInputRef={searchInputRef}
                filtersToggleRef={filtersToggleRef}
                onQuestsUpdate={(updatedQuests) => {
                  setQuests(updatedQuests);
                }}
                onAction={addAction}
              />
            )}
          </section>
        </ErrorBoundary>
      </div>

      <footer className="mt-16 text-center text-sm text-gray-500">
        {/* Footer content removed */}
      </footer>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </main>
  );
}
