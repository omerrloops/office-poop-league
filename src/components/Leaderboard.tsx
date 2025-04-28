
import React from 'react';
import { usePoopContext, formatTime } from '../context/PoopContext';
import { Skeleton } from '@/components/ui/skeleton';

type LeaderboardProps = {
  compact?: boolean;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ compact = false }) => {
  const { users, currentUser, weeklyWinner, isLoading } = usePoopContext();
  
  // Sort users by total time (descending)
  const sortedUsers = [...users].sort((a, b) => b.totalTimeWeekly - a.totalTimeWeekly);
  
  // Display fewer users in compact mode
  const displayUsers = compact ? sortedUsers.slice(0, 3) : sortedUsers;

  if (isLoading) {
    return (
      <div className={`w-full ${compact ? 'max-w-md' : 'max-w-2xl'} mx-auto`}>
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-2xl font-bold text-center text-poop-dark mb-4">
            {compact ? 'Top Poopers' : 'Weekly Leaderboard'}
          </h2>
          
          {compact ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="leaderboard-item">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded-full mr-3" />
                    <Skeleton className="w-8 h-8 rounded-full mr-3" />
                    <Skeleton className="w-24 h-6" />
                  </div>
                  <Skeleton className="w-16 h-6" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="leaderboard-item">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded-full mr-3" />
                    <Skeleton className="w-8 h-8 rounded-full mr-3" />
                    <Skeleton className="w-24 h-6" />
                  </div>
                  <Skeleton className="w-16 h-6" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${compact ? 'max-w-md' : 'max-w-2xl'} mx-auto`}>
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h2 className="text-2xl font-bold text-center text-poop-dark mb-4">
          {compact ? 'Top Poopers' : 'Weekly Leaderboard'}
        </h2>
        
        {weeklyWinner && (
          <div className="bg-gradient-to-r from-yellow-100 to-amber-100 p-3 rounded-xl mb-4">
            <div className="flex items-center">
              <div className="text-4xl mr-2">👑</div>
              <div>
                <p className="text-sm text-poop-dark opacity-80">Current Champion</p>
                <p className="font-bold text-poop">{weeklyWinner.name}</p>
              </div>
            </div>
          </div>
        )}
        
        {displayUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No poopers yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayUsers.map((user, index) => (
              <div 
                key={user.id} 
                className={`leaderboard-item ${user.id === currentUser?.id ? 'border-2 border-poop-accent' : ''}`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center font-bold text-poop bg-poop-bg rounded-full mr-3">
                    {index + 1}
                  </div>
                  <div className="text-2xl mr-2">{user.avatar}</div>
                  <div className="font-medium">{user.name}</div>
                  {user.id === currentUser?.id && (
                    <span className="ml-2 text-xs bg-poop-accent text-white px-2 py-1 rounded-full">
                      YOU
                    </span>
                  )}
                </div>
                <div className="font-bold text-poop">
                  {formatTime(user.totalTimeWeekly)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {compact && displayUsers.length > 0 && (
          <div className="mt-4 text-center">
            <a href="/leaderboard" className="text-poop hover:underline">
              View Full Leaderboard →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
