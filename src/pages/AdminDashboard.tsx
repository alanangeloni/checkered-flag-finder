import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogEditor from '@/components/blog-manager/BlogEditor';
import BlogsList from '@/components/blog-manager/BlogsList';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageWithProfiles } from '@/types/customTypes';
import { Eye, Trash } from 'lucide-react';

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [carListings, setCarListings] = useState<any[]>([]);
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to access this page');
        navigate('/login');
        return;
      }
      
      // Check if user is admin
      const { data: user, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      
      if (error || !user || !user.is_admin) {
        toast.error('You do not have permission to access this page');
        navigate('/');
        return;
      }
      
      setIsAdmin(true);
      
      // Fetch car listings
      fetchCarListings();
      
      // Fetch messages
      fetchMessages();
      
      setIsLoading(false);
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  const fetchCarListings = async () => {
    try {
      const { data, error } = await supabase
        .from('car_listings')
        .select(`
          *,
          profiles:user_id(username, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setCarListings(data || []);
    } catch (error) {
      console.error('Error fetching car listings:', error);
      toast.error('Failed to load car listings');
    }
  };
  
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(*),
          recipient:profiles!recipient_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };
  
  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car listing?')) return;
    
    try {
      const { error } = await supabase
        .from('car_listings')
        .delete()
        .eq('id', carId);
      
      if (error) throw error;
      
      toast.success('Car listing deleted successfully');
      fetchCarListings();
    } catch (error) {
      console.error('Error deleting car listing:', error);
      toast.error('Failed to delete car listing');
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
      
      toast.success('Message deleted successfully');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="blog">Blog Management</TabsTrigger>
            <TabsTrigger value="cars">Car Listings</TabsTrigger>
            <TabsTrigger value="messages">User Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blog">
            <Card>
              <CardHeader>
                <CardTitle>Blog Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="posts">Blog Posts</TabsTrigger>
                    <TabsTrigger value="create">Create New Post</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="posts">
                    <BlogsList />
                  </TabsContent>
                  
                  <TabsContent value="create">
                    <BlogEditor />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cars">
            <Card>
              <CardHeader>
                <CardTitle>Car Listings Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">ID</th>
                        <th className="p-2 text-left">Title</th>
                        <th className="p-2 text-left">User</th>
                        <th className="p-2 text-left">Price</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carListings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center">No car listings found</td>
                        </tr>
                      ) : (
                        carListings.map((car) => (
                          <tr key={car.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{car.id.substring(0, 8)}...</td>
                            <td className="p-2">{car.title}</td>
                            <td className="p-2">
                              {car.profiles?.full_name || car.profiles?.username || 'Unknown'}
                            </td>
                            <td className="p-2">${car.price?.toLocaleString()}</td>
                            <td className="p-2">
                              {new Date(car.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-2 flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/car-details/${car.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteCar(car.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>User Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">ID</th>
                        <th className="p-2 text-left">From</th>
                        <th className="p-2 text-left">To</th>
                        <th className="p-2 text-left">Content</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messages.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center">No messages found</td>
                        </tr>
                      ) : (
                        messages.map((message) => (
                          <tr key={message.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{message.id.substring(0, 8)}...</td>
                            <td className="p-2">
                              {message.sender?.full_name || message.sender?.username || 'Unknown'}
                            </td>
                            <td className="p-2">
                              {message.recipient?.full_name || message.recipient?.username || 'Unknown'}
                            </td>
                            <td className="p-2">
                              {message.content.length > 50 
                                ? `${message.content.substring(0, 50)}...` 
                                : message.content}
                            </td>
                            <td className="p-2">
                              {new Date(message.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-2 flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/messages/${message.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
