import React, { useState, useEffect, useRef } from 'react';
import { usePoopContext } from '../context/PoopContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Fun poop-themed emojis and reactions
const POOP_REACTIONS = [
  '💩', '🚽', '🧻', '😅', '🤣', '😳', '😬', '🤢', '🤮', '😷',
  '💨', '💦', '🔥', '❄️', '⏳', '⌛', '🎉', '🏆', '🙏', '🆘'
];

type ChatMessage = {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  message: string;
  created_at: string;
};

const PoopChat: React.FC = () => {
  const { currentUser, users, isPooping } = usePoopContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to chat messages
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase.channel('poop_chat');

    // Subscribe to new messages
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poop_chat'
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    // Fetch existing messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('poop_chat')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser]);

  const sendMessage = async (message: string) => {
    if (!currentUser || !message.trim()) return;

    const { error } = await supabase
      .from('poop_chat')
      .insert({
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_avatar: currentUser.avatar,
        message: message.trim()
      });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setNewMessage('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleReaction = (reaction: string) => {
    sendMessage(reaction);
  };

  if (!isPooping) return null;

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <CardHeader>
        <CardTitle className="text-center text-poop-dark">Poop Chat 💬</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-poop-bg text-sm">
                  {msg.user_avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{msg.user_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {POOP_REACTIONS.map((reaction) => (
            <Button
              key={reaction}
              variant="outline"
              size="sm"
              className="text-xl"
              onClick={() => handleReaction(reaction)}
            >
              {reaction}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" className="bg-poop hover:bg-poop-dark">
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PoopChat; 