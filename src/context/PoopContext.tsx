import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';

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

// Context type
type PoopContextType = {
  currentUser: User | null;
  users: User[];
  currentSession: PoopSession | null;
  isPooping: boolean;
  weeklyWinner: User | null;
  daysUntilReset: number;
  isLoading: boolean;
  
  // Methods
  startPooping: () => void;
  stopPooping: () => void;
  updateUserName: (name: string) => void;
  updateUserAvatar: (avatar: string) => void;
};

const PoopContext = createContext<PoopContextType | undefined>(undefined);

export const PoopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentSession, setCurrentSession] = useState<PoopSession | null>(null);
  const [isPooping, setIsPooping] = useState(false);
  const [weeklyWinner, setWeeklyWinner] = useState<User | null>(null);
  const [daysUntilReset, setDaysUntilReset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate days until Monday (start of week)
  useEffect(() => {
    const now = new Date();
    const daysFromMonday = (now.getDay() + 6) % 7; // Convert to Monday = 0, Sunday = 6
    setDaysUntilReset(7 - daysFromMonday);
  }, []);

  // Initialize data from Supabase and set up real-time subscriptions
  useEffect(() => {
    async function fetchData() {
      if (!authUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch all users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('total_time_weekly', { ascending: false });
          
        if (usersError) throw usersError;

        // Transform and set the users data
        const transformedUsers = await Promise.all(usersData.map(async (user) => {
          // Fetch poop sessions for each user
          const { data: sessions } = await supabase
            .from('poop_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('start_time', { ascending: false });

          // Fetch achievements for each user
          const { data: userAchievements } = await supabase
            .from('user_achievements')
            .select(`
              achievement_id,
              achievements (
                id, name, emoji, description
              )
            `)
            .eq('user_id', user.id);

          // Get all achievements to show locked ones too
          const { data: allAchievements } = await supabase
            .from('achievements')
            .select('*');

          // Create a complete achievements list with unlocked status
          const achievements = (allAchievements || []).map(achievement => {
            const isUnlocked = (userAchievements || []).some(ua => 
              ua.achievement_id === achievement.id
            );
            
            return {
              id: achievement.id,
              name: achievement.name,
              emoji: achievement.emoji,
              description: achievement.description,
              unlocked: isUnlocked
            };
          });

          return {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            totalTimeWeekly: user.total_time_weekly || 0,
            poopSessions: (sessions || []).map(session => ({
              id: session.id,
              startTime: new Date(session.start_time),
              endTime: session.end_time ? new Date(session.end_time) : null,
              duration: session.duration || null
            })),
            achievements
          };
        }));

        setUsers(transformedUsers);
        
        // Set the current user based on the stored userId in metadata
        const userId = authUser.user_metadata.userId || localStorage.getItem('userId');
        const currentUserData = transformedUsers.find(u => u.id === userId);
        
        if (userId && !currentUserData) {
          // If we have a stored userId but it doesn't match any user in the database
          localStorage.removeItem('userId');
          localStorage.removeItem('userNickname');
          // Remove any Supabase auth tokens
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          });
          window.location.reload();
          return;
        }
        
        if (currentUserData) {
          setCurrentUser(currentUserData);
          
          // Check if current user has an active session
          const activeSession = currentUserData.poopSessions.find(session => session.endTime === null);
          if (activeSession) {
            setCurrentSession(activeSession);
            setIsPooping(true);
          }
        }
        
        // Find weekly winner (user with highest total time)
        if (transformedUsers.length > 0) {
          const winner = [...transformedUsers].sort((a, b) => b.totalTimeWeekly - a.totalTimeWeekly)[0];
          setWeeklyWinner(winner);
        }

        // Set up real-time subscriptions
        const poopSessionsSubscription = supabase
          .channel('poop_sessions_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'poop_sessions'
            },
            async (payload) => {
              // Refresh the data when poop sessions change
              const { data: updatedUsersData } = await supabase
                .from('users')
                .select('id, name, avatar, total_time_weekly')
                .order('total_time_weekly', { ascending: false });

              if (updatedUsersData) {
                const updatedUsers = await Promise.all(updatedUsersData.map(async (user) => {
                  const { data: sessions } = await supabase
                    .from('poop_sessions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('start_time', { ascending: false });

                  return {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    totalTimeWeekly: user.total_time_weekly || 0,
                    poopSessions: (sessions || []).map(session => ({
                      id: session.id,
                      startTime: new Date(session.start_time),
                      endTime: session.end_time ? new Date(session.end_time) : null,
                      duration: session.duration || null
                    })),
                    achievements: [] // We don't need achievements for real-time updates
                  };
                }));

                setUsers(updatedUsers);
              }
            }
          )
          .subscribe();

        // Cleanup subscription on unmount
        return () => {
          poopSessionsSubscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [authUser]);

  const startPooping = async () => {
    if (isPooping || !currentUser) return;
    
    try {
      const newSession = {
        user_id: currentUser.id,
        start_time: new Date().toISOString(),
        end_time: null,
        duration: null
      };
      
      const { data, error } = await supabase
        .from('poop_sessions')
        .insert(newSession)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const sessionObj = {
          id: data.id,
          startTime: new Date(data.start_time),
          endTime: null,
          duration: null
        };
        
        setCurrentSession(sessionObj);
        setIsPooping(true);
      }
    } catch (error) {
      console.error('Error starting poop session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start poop session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const stopPooping = async () => {
    if (!isPooping || !currentUser || !currentSession) return;
    
    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentSession.startTime.getTime()) / 1000);
      
      // Update the session in database
      const { error: sessionError } = await supabase
        .from('poop_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration
        })
        .eq('id', currentSession.id);
        
      if (sessionError) throw sessionError;
      
      // Update user's total time
      const newTotalTime = currentUser.totalTimeWeekly + duration;
      
      const { error: userError } = await supabase
        .from('users')
        .update({
          total_time_weekly: newTotalTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);
        
      if (userError) throw userError;
      
      // Check for achievements
      await checkAchievements(duration, endTime);
      
      // Update the local state
      setCurrentUser(prev => {
        if (!prev) return null;
        
        const updatedSession = {
          ...currentSession,
          endTime,
          duration
        };
        
        return {
          ...prev,
          totalTimeWeekly: newTotalTime,
          poopSessions: [...prev.poopSessions, updatedSession]
        };
      });
      
      // Update the users array
      setUsers(prev => 
        prev.map(user => 
          user.id === currentUser.id 
            ? { 
                ...user, 
                totalTimeWeekly: newTotalTime,
                poopSessions: [...user.poopSessions, {
                  ...currentSession,
                  endTime,
                  duration
                }]
              } 
            : user
        )
      );
      
      // Check if this user is now the weekly winner
      if (!weeklyWinner || newTotalTime > weeklyWinner.totalTimeWeekly) {
        setWeeklyWinner({
          ...currentUser,
          totalTimeWeekly: newTotalTime
        });
      }
      
      // Reset current session
      setCurrentSession(null);
      setIsPooping(false);
      
      toast({
        title: 'Session Completed',
        description: `You pooped for ${formatTime(duration)}!`,
      });
    } catch (error) {
      console.error('Error stopping poop session:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop poop session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const checkAchievements = async (duration: number, endTime: Date = new Date()) => {
    if (!currentUser) return;
    
    try {
      // Get all achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*');
        
      if (!achievements) return;
      
      // Check for Lightning Pooper (under 60 seconds)
      if (duration < 60) {
        const lightningPooper = achievements.find(a => a.name === 'Lightning Pooper');
        if (lightningPooper) {
          await unlockAchievement(lightningPooper.id);
        }
      }
      
      // Check for Marathon Man (over 30 minutes)
      if (duration > 1800) {
        const marathonMan = achievements.find(a => a.name === 'Marathon Man');
        if (marathonMan) {
          await unlockAchievement(marathonMan.id);
        }
      }
      
      // Check for Power Pooper (10 sessions)
      if (currentUser.poopSessions.length >= 9) { // Current session is not yet counted
        const powerPooper = achievements.find(a => a.name === 'Power Pooper');
        if (powerPooper) {
          await unlockAchievement(powerPooper.id);
        }
      }
      
      // Check for Throne Master (2+ hours total)
      const totalTimeInSeconds = currentUser.totalTimeWeekly + duration;
      if (totalTimeInSeconds >= 7200) { // 2 hours = 7200 seconds
        const throneMaster = achievements.find(a => a.name === 'Throne Master');
        if (throneMaster) {
          await unlockAchievement(throneMaster.id);
        }
      }
      
      // Check for Early Bird (before 7 AM)
      const hour = endTime.getHours();
      if (hour < 7) {
        const earlyBird = achievements.find(a => a.name === 'Early Bird');
        if (earlyBird) {
          await unlockAchievement(earlyBird.id);
        }
      }
      
      // Check for Night Owl (after 10 PM)
      if (hour >= 22) {
        const nightOwl = achievements.find(a => a.name === 'Night Owl');
        if (nightOwl) {
          await unlockAchievement(nightOwl.id);
        }
      }
      
      // Check for Weekend Warrior
      const dayOfWeek = endTime.getDay(); // 0 is Sunday, 6 is Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Count weekend sessions
        const weekendSessions = currentUser.poopSessions.filter(session => {
          const sessionDay = new Date(session.startTime).getDay();
          return sessionDay === 0 || sessionDay === 6;
        }).length;
        
        if (weekendSessions >= 2) { // Current one is the third
          const weekendWarrior = achievements.find(a => a.name === 'Weekend Warrior');
          if (weekendWarrior) {
            await unlockAchievement(weekendWarrior.id);
          }
        }
      }
      
      // Note: Consistency King, Holiday Dump, and Traveler would need more complex logic
      // and additional data tracking which we can implement later
      
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!currentUser) return;
    
    try {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('achievement_id', achievementId)
        .maybeSingle();
        
      if (existing) return; // Already unlocked
      
      // Unlock the achievement
      await supabase
        .from('user_achievements')
        .insert({
          user_id: currentUser.id,
          achievement_id: achievementId
        });
      
      // Get achievement details
      const { data: achievement } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .single();
        
      if (achievement) {
        // Update local state
        setCurrentUser(prev => {
          if (!prev) return null;
          
          const updatedAchievements = prev.achievements.map(a => 
            a.id === achievementId ? { ...a, unlocked: true } : a
          );
          
          return {
            ...prev,
            achievements: updatedAchievements
          };
        });
        
        // Update users array
        setUsers(prev =>
          prev.map(user => {
            if (user.id === currentUser.id) {
              return {
                ...user,
                achievements: user.achievements.map(a => 
                  a.id === achievementId ? { ...a, unlocked: true } : a
                )
              };
            }
            return user;
          })
        );
        
        // Show toast
        toast({
          title: 'Achievement Unlocked! 🏆',
          description: `${achievement.name}: ${achievement.description}`,
        });
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const updateUserName = async (name: string) => {
    if (!currentUser || !name.trim()) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, name } : null);
      
      // Update users array
      setUsers(prev => 
        prev.map(user => 
          user.id === currentUser.id ? { ...user, name } : user
        )
      );
      
      // Update weekly winner if current user is the winner
      if (weeklyWinner && weeklyWinner.id === currentUser.id) {
        setWeeklyWinner(prev => prev ? { ...prev, name } : null);
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your name has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your name. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateUserAvatar = async (avatar: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ avatar })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, avatar } : null);
      
      // Update users array
      setUsers(prev => 
        prev.map(user => 
          user.id === currentUser.id ? { ...user, avatar } : user
        )
      );
      
      // Update weekly winner if current user is the winner
      if (weeklyWinner && weeklyWinner.id === currentUser.id) {
        setWeeklyWinner(prev => prev ? { ...prev, avatar } : null);
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your avatar has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to update your avatar. Please try again.',
        variant: 'destructive',
      });
    }
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
        isLoading,
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
