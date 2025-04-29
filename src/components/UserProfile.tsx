import React, { useState } from 'react';
import { usePoopContext, formatTime } from '../context/PoopContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AchievementBadge from './AchievementBadge';

const UserProfile: React.FC = () => {
  const { currentUser, updateUserAvatar, isLoading } = usePoopContext();
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [isEditing, setIsEditing] = useState(false);
  
  // Extended avatar options
  const avatarOptions = [
    '💩', '🚽', '🧻', '🧠', '👑', '🤖', '🐱', '🦄', '🐵', '🦊',
    '🦁', '🐶', '🐼', '🐨', '🦀', '🐢', '🦈', '🐬', '🐙', '🦧',
    '🐸', '🦜', '🦚', '🦉', '🦇', '🐺', '🐮', '🐷', '🐭', '🐹'
  ];
  
  const handleSave = () => {
    if (avatar) {
      updateUserAvatar(avatar);
    }
    
    setIsEditing(false);
  };
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-40 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-6">
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>
          <div className="text-center mb-6">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-4 w-40 mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentUser) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-poop-dark">My Poop Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          {isEditing ? (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2 text-center">
                Select an Avatar
              </p>
              <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                {avatarOptions.map((emojiOption) => (
                  <button
                    key={emojiOption}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${avatar === emojiOption ? 'bg-poop-accent text-white' : 'hover:bg-gray-100'}`}
                    onClick={() => setAvatar(emojiOption)}
                  >
                    {emojiOption}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Avatar className="w-24 h-24 bg-poop-bg text-5xl">
              <AvatarFallback className="bg-poop-bg">
                {currentUser.avatar}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4 mb-6">
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button className="bg-poop hover:bg-poop-dark" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">{currentUser.name}</h2>
            <p className="text-sm text-gray-500">Poop Enthusiast</p>
            <button
              className="mt-2 text-sm text-poop hover:underline"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500">Weekly Time</p>
            <p className="text-xl font-bold text-poop-dark">{formatTime(currentUser.totalTimeWeekly)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xs text-gray-500">Sessions</p>
            <p className="text-xl font-bold text-poop-dark">{currentUser.poopSessions.length}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">My Achievements</h3>
          <div className="grid grid-cols-3 gap-3">
            {currentUser.achievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
