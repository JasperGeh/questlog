'use client';

import { useState, useEffect, useRef } from 'react';
import { Quest } from './types';
import { loadQuests, performMigrationIfNeeded } from './services/storage';
import QuestForm from './components/QuestForm';
import QuestLog from './components/QuestLog';
import QuestStats from './components/QuestStats';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

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

  // Keyboard shortcuts
  useKeyboardShortcuts([
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
          <section>
            <QuestStats quests={quests} />
          </section>
        )}

        {/* New Quest Form */}
        <section>
          <QuestForm
            inputRef={questInputRef}
            onQuestAdded={(updatedQuests) => {
              setQuests(updatedQuests);
            }}
          />
        </section>

        {/* Quest Log */}
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
            />
          )}
        </section>
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
