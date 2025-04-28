
import React, { useState } from 'react';
import { usePoopContext, formatTime } from '../context/PoopContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AchievementBadge from './AchievementBadge';

const UserProfile: React.FC = () => {
  const { currentUser, updateUserName, updateUserAvatar } = usePoopContext();
  const [name, setName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const avatarOptions = ['💩', '🚽', '🧻', '🧠', '👑', '🤖', '🐱', '🦄', '🐵', '🦊'];
  
  const handleSave = () => {
    if (name.trim()) {
      updateUserName(name);
    }
    
    if (avatar) {
      updateUserAvatar(avatar);
    }
    
    setIsEditing(false);
  };
  
  if (!currentUser) return <div>Loading...</div>;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-poop-dark">My Poop Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-poop-bg flex items-center justify-center text-5xl">
            {isEditing ? (
              <div className="grid grid-cols-5 gap-2 p-2">
                {avatarOptions.map((emojiOption) => (
                  <button
                    key={emojiOption}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${avatar === emojiOption ? 'bg-poop-accent' : 'hover:bg-gray-100'}`}
                    onClick={() => setAvatar(emojiOption)}
                  >
                    {emojiOption}
                  </button>
                ))}
              </div>
            ) : (
              currentUser.avatar
            )}
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>
            
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
