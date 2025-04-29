import React, { useState, useEffect } from 'react';
import { usePoopContext } from '@/context/PoopContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Fun poop-themed emojis and reactions
const POOP_REACTIONS = [
  '💩', '🚽', '🧻', '😅', '🤣', '😳', '😬', '🤢', '🤮', '😷',
  '💨', '💦', '🔥', '❄️', '⏳', '⌛', '🎉', '🏆', '🙏', '🆘'
];

const ActivePoopers: React.FC = () => {
  const { users, currentUser } = usePoopContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleReaction = (userId: string, reaction: string) => {
    if (!currentUser) return;

    setUserReactions(prev => {
      // If the user already has this reaction, remove it
      if (prev[userId] === reaction) {
        const newReactions = { ...prev };
        delete newReactions[userId];
        return newReactions;
      }
      // Otherwise, add or update the reaction
      return {
        ...prev,
        [userId]: reaction
      };
    });
  };

  // Find users who are currently pooping (have an active session)
  const activePoopers = users.filter(user => 
    user.poopSessions.some(session => session.endTime === null)
  );

  // Format duration in minutes and seconds
  const formatDuration = (startTime: Date) => {
    const diffInSeconds = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (activePoopers.length === 0) return null;

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader>
        <CardTitle className="text-center text-poop-dark">Currently Pooping 🚽</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activePoopers.map(user => {
            const activeSession = user.poopSessions.find(session => session.endTime === null);
            if (!activeSession) return null;

            return (
              <div key={user.id} className="flex flex-col p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-poop-bg text-xl">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDuration(activeSession.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {POOP_REACTIONS.map(reaction => (
                    <button
                      key={reaction}
                      onClick={() => handleReaction(user.id, reaction)}
                      className={`text-xl p-1.5 rounded-full transition-colors ${
                        userReactions[user.id] === reaction
                          ? 'bg-poop text-white'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      {reaction}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivePoopers; 