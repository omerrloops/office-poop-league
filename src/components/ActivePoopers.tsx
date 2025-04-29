import React, { useState, useEffect } from 'react';
import { usePoopContext } from '@/context/PoopContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

// Fun poop-themed emojis and reactions
const POOP_REACTIONS = [
  '💩', '🚽', '🧻', '😅', '🤣', '😳', '😬', '🤢', '🤮', '😷',
  '💨', '💦', '🔥', '❄️', '⏳', '⌛', '🎉', '🏆', '🙏', '🆘'
];

type UserReaction = {
  user_id: string;
  reaction: string;
};

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

  // Subscribe to user reactions
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel('user_reactions');

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_reactions'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const reaction = payload.new as UserReaction;
            setUserReactions(prev => ({
              ...prev,
              [reaction.user_id]: reaction.reaction
            }));
          } else if (payload.eventType === 'DELETE') {
            const reaction = payload.old as UserReaction;
            setUserReactions(prev => {
              const newReactions = { ...prev };
              delete newReactions[reaction.user_id];
              return newReactions;
            });
          }
        }
      )
      .subscribe();

    // Fetch existing reactions
    const fetchReactions = async () => {
      const { data } = await supabase
        .from('user_reactions')
        .select('*');

      if (data) {
        const reactions: Record<string, string> = {};
        data.forEach((reaction: UserReaction) => {
          reactions[reaction.user_id] = reaction.reaction;
        });
        setUserReactions(reactions);
      }
    };

    fetchReactions();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser]);

  const handleReaction = async (userId: string, reaction: string) => {
    if (!currentUser) return;

    // If the user already has this reaction, remove it
    if (userReactions[userId] === reaction) {
      await supabase
        .from('user_reactions')
        .delete()
        .eq('user_id', userId);
    } else {
      // Otherwise, update or insert the reaction
      await supabase
        .from('user_reactions')
        .upsert({
          user_id: userId,
          reaction
        });
    }
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
        <div className="grid grid-cols-2 gap-4">
          {activePoopers.map(user => {
            const activeSession = user.poopSessions.find(session => session.endTime === null);
            if (!activeSession) return null;

            return (
              <div key={user.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-poop-bg text-xl">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDuration(activeSession.startTime)}
                  </p>
                </div>
                <div className="flex space-x-1">
                  {POOP_REACTIONS.map(reaction => (
                    <button
                      key={reaction}
                      onClick={() => handleReaction(user.id, reaction)}
                      className={`text-xl p-1 rounded-full transition-colors ${
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