
import React from 'react';
import { usePoopContext, formatTime } from '../context/PoopContext';
import { Card } from '@/components/ui/card';

const WeeklyWinner: React.FC = () => {
  const { weeklyWinner, daysUntilReset } = usePoopContext();

  if (!weeklyWinner) return null;

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 via-poop-accent to-yellow-400 p-1"></div>
      <div className="p-6 text-center">
        <div className="winner-crown mb-2">👑</div>
        <h2 className="text-xl font-bold">Current Champion</h2>
        <div className="flex justify-center my-4">
          <div className="w-20 h-20 rounded-full bg-poop-bg flex items-center justify-center text-4xl">
            {weeklyWinner.avatar}
          </div>
        </div>
        <div className="mb-4">
          <p className="text-2xl font-bold text-poop">{weeklyWinner.name}</p>
          <p className="text-xl text-gray-700">{formatTime(weeklyWinner.totalTimeWeekly)}</p>
        </div>
        <div className="text-sm text-gray-500">
          <p>New champion crowned in {daysUntilReset} days</p>
        </div>
      </div>
    </Card>
  );
};

export default WeeklyWinner;
