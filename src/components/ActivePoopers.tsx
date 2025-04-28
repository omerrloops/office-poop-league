import React from 'react';
import { usePoopContext } from '@/context/PoopContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ActivePoopers: React.FC = () => {
  const { users } = usePoopContext();

  // Find users who are currently pooping (have an active session)
  const activePoopers = users.filter(user => 
    user.poopSessions.some(session => session.endTime === null)
  );

  if (activePoopers.length === 0) return null;

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader>
        <CardTitle className="text-center text-poop-dark">Currently Pooping 🚽</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {activePoopers.map(user => (
            <div key={user.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-poop-bg text-xl">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-gray-500">In progress...</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivePoopers; 