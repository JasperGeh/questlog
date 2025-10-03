'use client';

import { Quest } from '../types';
import { useMemo } from 'react';

interface QuestStatsProps {
  quests: Quest[];
}

export default function QuestStats({ quests }: QuestStatsProps) {
  const stats = useMemo(() => {
    const total = quests.length;
    const completed = quests.filter(q => q.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Calculate streak (consecutive days with completions)
    const completedQuests = quests
      .filter(q => q.completed && q.completedAt)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const quest of completedQuests) {
      if (!quest.completedAt) continue;

      const questDate = new Date(quest.completedAt);
      questDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        // First quest
        const daysDiff = Math.floor((today.getTime() - questDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 0 || daysDiff === 1) {
          currentStreak = 1;
          tempStreak = 1;
        }
        lastDate = questDate;
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - questDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
          if (daysDiff === 1) {
            tempStreak++;
            if (currentStreak > 0) currentStreak++;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
          currentStreak = 0;
        }

        lastDate = questDate;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Calculate souls (points) - 10 per completed quest, 5 bonus per subtask
    const souls = quests.reduce((total, quest) => {
      let questSouls = quest.completed ? 10 : 0;
      const completedSubtasks = quest.subTasks.filter(st => st.completed).length;
      questSouls += completedSubtasks * 5;
      return total + questSouls;
    }, 0);

    // Calculate quest mastery level (every 100 souls = 1 level)
    const masteryLevel = Math.floor(souls / 100);

    // Get most productive day
    const dayCompletions: Record<string, number> = {};
    completedQuests.forEach(quest => {
      if (quest.completedAt) {
        const day = new Date(quest.completedAt).toLocaleDateString('en-US', { weekday: 'long' });
        dayCompletions[day] = (dayCompletions[day] || 0) + 1;
      }
    });

    const mostProductiveDay = Object.entries(dayCompletions)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None yet';

    return {
      total,
      completed,
      active,
      completionRate,
      currentStreak,
      longestStreak,
      souls,
      masteryLevel,
      mostProductiveDay
    };
  }, [quests]);

  const getMasteryTitle = (level: number) => {
    if (level === 0) return 'Hollow Wanderer';
    if (level < 5) return 'Unkindled Ash';
    if (level < 10) return 'Bearer of the Curse';
    if (level < 20) return 'Chosen Undead';
    if (level < 50) return 'Lord of Cinder';
    return 'Dark Soul';
  };

  return (
    <div className="quest-card mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Chronicle of Deeds</h2>
        <p className="text-sm italic text-gray-400">Thy journey through shadow and light</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Quests */}
        <div className="bg-[#2a233c] p-4 rounded-md border border-[#3d3554]">
          <div className="text-3xl font-bold text-[#d4af37]">{stats.total}</div>
          <div className="text-sm text-gray-400 mt-1">Total Quests</div>
        </div>

        {/* Completed */}
        <div className="bg-[#2a233c] p-4 rounded-md border border-[#3d3554]">
          <div className="text-3xl font-bold text-[#4f7259]">{stats.completed}</div>
          <div className="text-sm text-gray-400 mt-1">Completed</div>
        </div>

        {/* Active */}
        <div className="bg-[#2a233c] p-4 rounded-md border border-[#3d3554]">
          <div className="text-3xl font-bold text-[#8a63d2]">{stats.active}</div>
          <div className="text-sm text-gray-400 mt-1">Active</div>
        </div>

        {/* Completion Rate */}
        <div className="bg-[#2a233c] p-4 rounded-md border border-[#3d3554]">
          <div className="text-3xl font-bold text-[#e6e1f0]">{stats.completionRate}%</div>
          <div className="text-sm text-gray-400 mt-1">Success Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Souls & Mastery */}
          <div className="bg-[#2a233c] p-4 rounded-md border-2 border-[#8a7f55]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Souls Collected</span>
              <span className="text-2xl font-bold text-[#d4af37]">{stats.souls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Mastery</span>
              <span className="text-lg font-bold text-[#e6e1f0]">
                Level {stats.masteryLevel}
              </span>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm italic text-[#d4af37]">{getMasteryTitle(stats.masteryLevel)}</p>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-[#2a233c] p-4 rounded-md border border-[#3d3554]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Current Streak</span>
              <span className="text-2xl font-bold text-[#ff8c42]">
                {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              {stats.currentStreak > 0
                ? 'The flame burns bright...'
                : 'The embers grow cold...'}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Longest Streak */}
          <div className="bg-[#2a233c] p-4 rounded-md border border-[#3d3554]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Longest Streak</span>
              <span className="text-2xl font-bold text-[#e6e1f0]">
                {stats.longestStreak} {stats.longestStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              A record of perseverance
            </div>
          </div>

          {/* Most Productive Day */}
          <div className="bg-[#2a233c] p-4 rounded-md border border-[#3d3554]">
            <div className="text-sm text-gray-400 mb-1">Most Productive Day</div>
            <div className="text-xl font-bold text-[#e6e1f0]">
              {stats.mostProductiveDay}
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              When thy resolve is strongest
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Quest Completion</span>
            <span>{stats.completed} / {stats.total}</span>
          </div>
          <div className="w-full bg-[#2a233c] rounded-full h-3 border border-[#3d3554]">
            <div
              className="bg-gradient-to-r from-[#4f7259] to-[#8a7f55] h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="mt-6 p-4 bg-[#2a233c] rounded-md border-l-4 border-[#8a7f55]">
        <p className="text-sm italic text-gray-300">
          {stats.currentStreak >= 7 && "Thy dedication rivals the ancient lords themselves!"}
          {stats.currentStreak >= 3 && stats.currentStreak < 7 && "The path grows clearer with each passing day."}
          {stats.currentStreak < 3 && stats.currentStreak > 0 && "A journey of a thousand miles begins with a single step."}
          {stats.currentStreak === 0 && stats.completed > 0 && "Even the mightiest fall, yet they rise again."}
          {stats.completed === 0 && "The road ahead is long, but the first step awaits."}
        </p>
      </div>
    </div>
  );
}
