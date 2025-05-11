
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mail, Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Message {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
  car_id: string | null;
  sender: {
    id: string;
    full_name: string | null;
    username: string | null;
  };
  recipient: {
    id: string;
    full_name: string | null;
    username: string | null;
  };
  car?: {
    name: string;
  };
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!sender_id(*),
            recipient:profiles!recipient_id(*),
            car:car_listings(name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setMessages(data || []);
        setFilteredMessages(data || []);
      } catch (error: any) {
        console.error("Error fetching messages:", error);
        toast.error(error.message || "Error fetching messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const results = messages.filter(message =>
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.sender.full_name && message.sender.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.sender.username && message.sender.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.recipient.full_name && message.recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.recipient.username && message.recipient.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.car?.name && message.car.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredMessages(results);
  }, [searchTerm, messages]);

  const viewMessage = (message: Message) => {
    setSelectedMessage(message);
    setDialogOpen(true);
  };

  const toggleReadStatus = async (id: string, isCurrentlyRead: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: !isCurrentlyRead })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === id ? { ...message, read: !isCurrentlyRead } : message
        )
      );
      
      toast.success(`Message marked as ${!isCurrentlyRead ? 'read' : 'unread'}`);
    } catch (error: any) {
      console.error("Error updating message status:", error);
      toast.error(error.message || "Error updating message status");
    }
  };

  const formatName = (user: { full_name: string | null, username: string | null }) => {
    return user.full_name || user.username || "Unknown User";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Message Management</h1>
      
      <div className="mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading messages...</TableCell>
                </TableRow>
              ) : filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No messages found</TableCell>
                </TableRow>
              ) : (
                filteredMessages.map(message => (
                  <TableRow key={message.id} className={!message.read ? "bg-blue-50" : undefined}>
                    <TableCell className="font-medium">{formatName(message.sender)}</TableCell>
                    <TableCell>{formatName(message.recipient)}</TableCell>
                    <TableCell>
                      {message.car ? (
                        message.car.name
                      ) : (
                        "General Message"
                      )}
                    </TableCell>
                    <TableCell>
                      {message.read ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">Read</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Unread</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(message.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <p className="truncate w-48">{message.content}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => viewMessage(message)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleReadStatus(message.id, message.read)}
                        >
                          {message.read ? (
                            <Mail className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Message Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">From</p>
                  <p>{formatName(selectedMessage.sender)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To</p>
                  <p>{formatName(selectedMessage.recipient)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{selectedMessage.read ? 'Read' : 'Unread'}</p>
                </div>
                {selectedMessage.car && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-500">Related To</p>
                    <p>{selectedMessage.car.name}</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Message</p>
                <Textarea className="h-48 mt-1" value={selectedMessage.content} readOnly />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;
