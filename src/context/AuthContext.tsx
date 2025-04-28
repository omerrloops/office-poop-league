import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (nickname: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (nickname: string) => {
    try {
      // First, check if nickname is already taken
      const { data: existingUser } = await supabase
        .from('users')
        .select('name')
        .eq('name', nickname)
        .single();

      if (existingUser) {
        toast({
          title: 'Error',
          description: 'This nickname is already taken. Please choose another one.',
          variant: 'destructive',
        });
        throw new Error('Nickname already taken');
      }

      // Sign in anonymously
      const { data: { user: anonymousUser }, error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) throw signInError;

      if (!anonymousUser) throw new Error('Failed to create user');

      // Create user record in users table
      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          user_id: anonymousUser.id,
          id: anonymousUser.id, // Use the same ID for both auth and user record
          name: nickname,
          avatar: '💩', // Default avatar
          total_time_weekly: 0
        });

      if (createUserError) throw createUserError;

      // Update the user's metadata with their nickname
      const { error: updateError } = await supabase.auth.updateUser({
        data: { nickname }
      });
      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: `Welcome, ${nickname}!`,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'You have been signed out successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 