
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type AchievementProps = {
  achievement: {
    id: string;
    name: string;
    emoji: string;
    description: string;
    unlocked: boolean;
  };
};

const AchievementBadge: React.FC<AchievementProps> = ({ achievement }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center p-2 ${
              achievement.unlocked
                ? 'bg-gradient-to-br from-poop-bg to-poop-accent/30'
                : 'bg-gray-100'
            }`}
          >
            <div className="text-3xl mb-1">
              {achievement.unlocked ? achievement.emoji : '🔒'}
            </div>
            <div className="text-xs text-center font-medium truncate w-full">
              {achievement.name}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-bold">{achievement.name}</p>
            <p>{achievement.description}</p>
            {!achievement.unlocked && <p className="text-gray-500 mt-1">Not yet unlocked</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementBadge;
