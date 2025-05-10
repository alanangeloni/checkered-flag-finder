
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageWithProfiles } from '@/types/customTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Mail, Inbox } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserMessagesProps {
  userId: string;
}

const UserMessages = ({ userId }: UserMessagesProps) => {
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageType, setMessageType] = useState<'received' | 'sent'>('received');
  const isMobile = useIsMobile();

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h3 className="text-xl font-medium">Messages</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant={messageType === 'received' ? 'default' : 'outline'} 
            size={isMobile ? "sm" : "sm"}
            onClick={() => setMessageType('received')}
            className="flex-1 sm:flex-initial"
          >
            <Inbox className="h-4 w-4 mr-2" />
            Inbox
          </Button>
          <Button 
            variant={messageType === 'sent' ? 'default' : 'outline'} 
            size={isMobile ? "sm" : "sm"}
            onClick={() => setMessageType('sent')}
            className="flex-1 sm:flex-initial"
          >
            <Mail className="h-4 w-4 mr-2" />
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
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
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
                      <Link to={`/car-details/${message.car_id}`} className="mt-2 sm:mt-0">
                        <Button variant="outline" size="sm">View Listing</Button>
                      </Link>
                    )}
                  </div>
                  
                  <p className="mt-3 break-words">{message.content}</p>
                  
                  <div className="flex flex-wrap justify-end gap-2 mt-3">
                    <Link to={`/messages/${message.id}`}>
                      <Button size="sm">
                        {messageType === 'received' ? 'Reply' : 'View'}
                      </Button>
                    </Link>
                    
                    {!message.read && messageType === 'received' && (
                      <Button 
                        variant="outline" 
                        size="sm"
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
