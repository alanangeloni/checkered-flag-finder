
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminBlogManager from '@/components/admin/AdminBlogManager';
import AdminListingsManager from '@/components/admin/AdminListingsManager';
import AdminMessagesManager from '@/components/admin/AdminMessagesManager';
import AdminUsersManager from '@/components/admin/AdminUsersManager';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('You must be logged in to access the admin dashboard');
          navigate('/login');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        
        if (!profile || !profile.is_admin) {
          toast.error('You do not have permission to access this page');
          navigate('/');
        }
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        toast.error(error.message || 'An error occurred while checking admin status');
        navigate('/');
      }
    };

    checkAdminStatus();
  }, [navigate]);

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="blogs" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="blogs">
          <AdminBlogManager />
        </TabsContent>
        
        <TabsContent value="listings">
          <AdminListingsManager />
        </TabsContent>
        
        <TabsContent value="messages">
          <AdminMessagesManager />
        </TabsContent>
        
        <TabsContent value="users">
          <AdminUsersManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
