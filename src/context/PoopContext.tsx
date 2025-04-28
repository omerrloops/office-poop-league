
import React, { createContext, useState, useContext, useEffect } from 'react';

// Types for our context
type User = {
  id: string;
  name: string;
  avatar: string;
  totalTimeWeekly: number;
  poopSessions: PoopSession[];
  achievements: Achievement[];
};

type PoopSession = {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
};

type Achievement = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
};

// Mock data for testing
const mockUsers: User[] = [
  {
    id: '1',
    name: 'ThroneMaster',
    avatar: '💩',
    totalTimeWeekly: 3600, // seconds
    poopSessions: [
      { id: '1', startTime: new Date(Date.now() - 86400000), endTime: new Date(Date.now() - 86400000 + 600000), duration: 600 }
    ],
    achievements: [
      { id: '1', name: 'First Timer', emoji: '🎯', description: 'First poop tracked', unlocked: true },
      { id: '2', name: 'Lightning Pooper', emoji: '⚡', description: 'Complete a session under 1 minute', unlocked: false },
      { id: '3', name: 'Marathon Man', emoji: '🏃‍♂️', description: 'Session longer than 30 minutes', unlocked: false },
    ]
  },
  {
    id: '2',
    name: 'ToiletKing',
    avatar: '👑',
    totalTimeWeekly: 5400, // seconds
    poopSessions: [
      { id: '2', startTime: new Date(Date.now() - 172800000), endTime: new Date(Date.now() - 172800000 + 900000), duration: 900 }
    ],
    achievements: [
      { id: '1', name: 'First Timer', emoji: '🎯', description: 'First poop tracked', unlocked: true },
      { id: '2', name: 'Lightning Pooper', emoji: '⚡', description: 'Complete a session under 1 minute', unlocked: true },
      { id: '3', name: 'Marathon Man', emoji: '🏃‍♂️', description: 'Session longer than 30 minutes', unlocked: false },
    ]
  },
  {
    id: '3',
    name: 'PoopMaster3000',
    avatar: '🤖',
    totalTimeWeekly: 7200, // seconds - the leader!
    poopSessions: [
      { id: '3', startTime: new Date(Date.now() - 259200000), endTime: new Date(Date.now() - 259200000 + 1200000), duration: 1200 }
    ],
    achievements: [
      { id: '1', name: 'First Timer', emoji: '🎯', description: 'First poop tracked', unlocked: true },
      { id: '2', name: 'Lightning Pooper', emoji: '⚡', description: 'Complete a session under 1 minute', unlocked: false },
      { id: '3', name: 'Marathon Man', emoji: '🏃‍♂️', description: 'Session longer than 30 minutes', unlocked: true },
    ]
  }
];

// Context type
type PoopContextType = {
  currentUser: User | null;
  users: User[];
  currentSession: PoopSession | null;
  isPooping: boolean;
  weeklyWinner: User | null;
  daysUntilReset: number;
  
  // Methods
  startPooping: () => void;
  stopPooping: () => void;
  updateUserName: (name: string) => void;
  updateUserAvatar: (avatar: string) => void;
};

const PoopContext = createContext<PoopContextType | undefined>(undefined);

export const PoopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentSession, setCurrentSession] = useState<PoopSession | null>(null);
  const [isPooping, setIsPooping] = useState(false);
  const [weeklyWinner, setWeeklyWinner] = useState<User | null>(null);
  const [daysUntilReset, setDaysUntilReset] = useState(0);

  // Initialize with mock user for demo
  useEffect(() => {
    setCurrentUser(mockUsers[0]);
    
    // Calculate days until Monday (start of week)
    const now = new Date();
    const daysFromMonday = (now.getDay() + 6) % 7; // Convert to Monday = 0, Sunday = 6
    setDaysUntilReset(7 - daysFromMonday);
    
    // Find weekly winner (user with highest total time)
    const winner = [...mockUsers].sort((a, b) => b.totalTimeWeekly - a.totalTimeWeekly)[0];
    setWeeklyWinner(winner);
  }, []);

  const startPooping = () => {
    if (isPooping || !currentUser) return;
    
    const newSession: PoopSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: null,
      duration: null
    };
    
    setCurrentSession(newSession);
    setIsPooping(true);
  };

  const stopPooping = () => {
    if (!isPooping || !currentUser || !currentSession) return;
    
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
    
    const updatedSession = {
      ...currentSession,
      endTime,
      duration
    };
    
    // Update user's sessions and total time
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        poopSessions: [...currentUser.poopSessions, updatedSession],
        totalTimeWeekly: currentUser.totalTimeWeekly + duration
      };
      
      setCurrentUser(updatedUser);
      
      // Update the user in the list
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    }
    
    // Check for achievements
    checkAchievements(duration);
    
    setCurrentSession(null);
    setIsPooping(false);
  };

  const checkAchievements = (duration: number) => {
    if (!currentUser) return;
    
    const updatedAchievements = [...currentUser.achievements];
    
    // Check for Lightning Pooper (under 60 seconds)
    if (duration < 60) {
      const lightningPooper = updatedAchievements.find(a => a.id === '2');
      if (lightningPooper && !lightningPooper.unlocked) {
        lightningPooper.unlocked = true;
      }
    }
    
    // Check for Marathon Man (over 30 minutes)
    if (duration > 1800) {
      const marathonMan = updatedAchievements.find(a => a.id === '3');
      if (marathonMan && !marathonMan.unlocked) {
        marathonMan.unlocked = true;
      }
    }
    
    // Update the user with new achievements
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        achievements: updatedAchievements
      };
      
      setCurrentUser(updatedUser);
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    }
  };

  const updateUserName = (name: string) => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      name
    };
    
    setCurrentUser(updatedUser);
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  const updateUserAvatar = (avatar: string) => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      avatar
    };
    
    setCurrentUser(updatedUser);
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  return (
    <PoopContext.Provider
      value={{
        currentUser,
        users,
        currentSession,
        isPooping,
        weeklyWinner,
        daysUntilReset,
        startPooping,
        stopPooping,
        updateUserName,
        updateUserAvatar
      }}
    >
      {children}
    </PoopContext.Provider>
  );
};

export const usePoopContext = () => {
  const context = useContext(PoopContext);
  if (context === undefined) {
    throw new Error('usePoopContext must be used within a PoopProvider');
  }
  return context;
};

// Helper to format seconds into a nice string
export const formatTime = (seconds: number): string => {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
