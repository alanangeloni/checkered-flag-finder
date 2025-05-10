
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageWithProfiles } from '@/types/customTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mail, inbox } from 'lucide-react';

interface UserMessagesProps {
  userId: string;
}

const UserMessages = ({ userId }: UserMessagesProps) => {
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        let query;
        
        if (messageType === 'received') {
          query = supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!sender_id(*)
            `)
            .eq('recipient_id', userId)
            .order('created_at', { ascending: false });
        } else {
          query = supabase
            .from('messages')
            .select(`
              *,
              recipient:profiles!recipient_id(*)
            `)
            .eq('sender_id', userId)
            .order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;

        if (error) throw error;
        
        setMessages(data as MessageWithProfiles[] || []);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMessages();
    }
  }, [userId, messageType]);

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
      
      if (error) throw error;
      
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      toast.error('Failed to update message status');
    }
  };

  if (loading) {
    return <div className="py-4">Loading messages...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Messages</h3>
        <div className="flex gap-2">
          <Button 
            variant={messageType === 'received' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMessageType('received')}
          >
            <inbox className="h-4 w-4 mr-2" />
            Inbox
          </Button>
          <Button 
            variant={messageType === 'sent' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setMessageType('sent')}
          >
            <mail className="h-4 w-4 mr-2" />
            Sent
          </Button>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No {messageType} messages</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => {
            const otherUser = messageType === 'received' 
              ? message.sender 
              : message.recipient;
            
            return (
              <Card 
                key={message.id} 
                className={`transition-colors ${!message.read && messageType === 'received' ? 'bg-blue-50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{otherUser?.full_name || otherUser?.username || 'User'}</span>
                        {!message.read && messageType === 'received' && (
                          <Badge variant="default" className="bg-blue-500">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    {message.car_id && (
                      <Link to={`/car-details/${message.car_id}`}>
                        <Button variant="outline" size="sm">View Listing</Button>
                      </Link>
                    )}
                  </div>
                  
                  <p className="mt-3">{message.content}</p>
                  
                  <div className="flex justify-end mt-3">
                    <Link to={`/messages/${message.id}`}>
                      <Button size="sm">
                        {messageType === 'received' ? 'Reply' : 'View'}
                      </Button>
                    </Link>
                    
                    {!message.read && messageType === 'received' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => markAsRead(message.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserMessages;
