
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { MessageWithProfiles } from '@/types/customTypes';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { send } from 'lucide-react';

const Messages = () => {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<MessageWithProfiles | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please login to view messages');
        navigate('/login');
        return;
      }
      
      setUser(session.user);

      if (id) {
        try {
          // Fetch the message details
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!sender_id(*),
              recipient:profiles!recipient_id(*)
            `)
            .eq('id', id)
            .single();

          if (error) throw error;
          
          if (!data) {
            toast.error('Message not found');
            navigate('/profile');
            return;
          }

          // Check if the user is either the sender or recipient
          if (data.sender_id !== session.user.id && data.recipient_id !== session.user.id) {
            toast.error('You do not have permission to view this message');
            navigate('/profile');
            return;
          }

          // Mark as read if user is recipient
          if (data.recipient_id === session.user.id && !data.read) {
            await supabase
              .from('messages')
              .update({ read: true })
              .eq('id', id);
          }

          setMessage(data as MessageWithProfiles);
        } catch (error) {
          console.error('Error fetching message:', error);
          toast.error('Failed to load message');
        }
      }
      
      setLoading(false);
    };

    getUser();
  }, [id, navigate]);

  const sendReply = async () => {
    if (!user || !message || !replyContent.trim()) return;
    
    try {
      setSending(true);
      
      // Determine recipient (the other party from the original message)
      const recipientId = user.id === message.sender_id 
        ? message.recipient_id 
        : message.sender_id;
      
      const { error } = await supabase
        .from('messages')
        .insert({
          content: replyContent.trim(),
          sender_id: user.id,
          recipient_id: recipientId,
          car_id: message.car_id // Keep reference to the same car if applicable
        });
      
      if (error) throw error;
      
      toast.success('Reply sent successfully');
      setReplyContent('');
      
      // Refresh the current page to show the updated conversation
      navigate('/profile');
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-racecar-lightgray">
        <Header />
        <div className="container mx-auto py-16 px-4">
          <p>Loading message...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-racecar-lightgray">
      <Header />
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Message Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{message.sender.full_name || message.sender.username || 'User'}</p>
                      <p className="text-sm text-gray-500">{new Date(message.created_at).toLocaleString()}</p>
                    </div>
                    {message.car_id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/car-details/${message.car_id}`)}
                      >
                        View Listing
                      </Button>
                    )}
                  </div>
                  <p className="mt-4">{message.content}</p>
                </div>

                {user && user.id !== message.sender_id && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Reply</h3>
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                      className="w-full"
                    />
                    <div className="flex justify-end mt-3">
                      <Button 
                        disabled={!replyContent.trim() || sending}
                        onClick={sendReply}
                      >
                        <send className="h-4 w-4 mr-2" />
                        {sending ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => navigate('/profile')}>
                Back to Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Messages;
