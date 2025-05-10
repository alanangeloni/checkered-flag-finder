
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface ContactSellerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carTitle: string;
  sellerId: string;
}

const ContactSellerDialog = ({ isOpen, onClose, carId, carTitle, sellerId }: ContactSellerDialogProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      
      // Get the current user's session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to send a message');
        return;
      }

      const { error } = await supabase.from('messages').insert({
        content: message.trim(),
        car_id: carId,
        sender_id: session.user.id,
        recipient_id: sellerId
      });

      if (error) throw error;
      
      toast.success('Message sent successfully');
      setMessage('');
      onClose();
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Seller</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm font-medium mb-1">About: {carTitle}</p>
            <Textarea
              placeholder="Write your message to the seller..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full"
              disabled={sending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="ml-2"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSellerDialog;
