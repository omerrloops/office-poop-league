import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const SignInForm = () => {
  const [nickname, setNickname] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(nickname);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Enter Your Nickname</CardTitle>
        <CardDescription>Choose a nickname to join the league</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              minLength={3}
              maxLength={20}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Join
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}; 