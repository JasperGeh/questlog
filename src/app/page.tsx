'use client';

import { useState, useEffect } from 'react';
import { Quest } from './types';
import { loadQuests } from './services/questStorage';
import QuestForm from './components/QuestForm';
import QuestLog from './components/QuestLog';

export default function Home() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
        <p className="text-xl italic">What destiny awaits thee?</p>
      </header>
      
      <div className="space-y-10">
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
        <p className="mt-1">Use the API at /api/quest to add quests via iOS Shortcuts</p>
      </footer>
    </main>
  );
}
