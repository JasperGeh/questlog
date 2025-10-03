'use client';

import { useState, useEffect } from 'react';
import { Quest } from './types';
import { loadQuests } from './services/questStorage';
import QuestForm from './components/QuestForm';
import QuestLog from './components/QuestLog';
import QuestStats from './components/QuestStats';

export default function Home() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);

  // Load quests from local storage on initial render
  useEffect(() => {
    const storedQuests = loadQuests();
    setQuests(storedQuests);
    setIsLoading(false);
  }, []);

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Quest Log</h1>
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
    </main>
  );
}
