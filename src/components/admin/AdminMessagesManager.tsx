import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  car_id: string | null;
  read: boolean;
  created_at: string;
  sender_profile?: {
    username: string;
  };
  recipient_profile?: {
    username: string;
  };
}

const AdminMessagesManager = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!sender_id(username),
          recipient_profile:profiles!recipient_id(username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch messages');
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openMessageDialog = (message: Message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('messages')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Message deleted successfully');
        fetchMessages();
        if (selectedMessage?.id === id) {
          setIsDialogOpen(false);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete message');
        console.error('Error deleting message:', error);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">User Messages</h2>
      </div>

      {isLoading ? (
        <p>Loading messages...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Content Preview</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Read</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No messages found</TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>{message.sender_profile?.username || message.sender_id}</TableCell>
                  <TableCell>{message.recipient_profile?.username || message.recipient_id}</TableCell>
                  <TableCell>{message.content.substring(0, 50)}...</TableCell>
                  <TableCell>{new Date(message.created_at).toLocaleString()}</TableCell>
                  <TableCell>{message.read ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openMessageDialog(message)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(message.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-semibold">From:</p>
                  <p>{selectedMessage.sender_profile?.username || selectedMessage.sender_id}</p>
                </div>
                <div>
                  <p className="font-semibold">To:</p>
                  <p>{selectedMessage.recipient_profile?.username || selectedMessage.recipient_id}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold">Date:</p>
                <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <p>{selectedMessage.read ? 'Read' : 'Unread'}</p>
              </div>
              {selectedMessage.car_id && (
                <div>
                  <p className="font-semibold">Related Car Listing:</p>
                  <Link to={`/car-details/${selectedMessage.car_id}`} className="text-blue-600 hover:underline">
                    View Listing
                  </Link>
                </div>
              )}
              <div>
                <p className="font-semibold">Message:</p>
                <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(selectedMessage.id)}
                >
                  Delete Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessagesManager;
