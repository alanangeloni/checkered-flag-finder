
import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Car, Users, MessageSquare, FileText, Settings, Home } from 'lucide-react';
import { toast } from 'sonner';
import Footer from '@/components/Footer';

const AdminLayout = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Please log in to access admin area");
          navigate('/login');
          return;
        }
        
        // Check if user is admin
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        if (error) throw error;
        
        if (!profile || !profile.is_admin) {
          toast.error("You don't have permission to access this area");
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
      } catch (error: any) {
        console.error("Admin check error:", error);
        toast.error(error.message || "Error checking admin status");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking credentials...</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-100 p-4 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold ml-2">Admin Dashboard</h1>
              </div>
              <Link to="/" className="text-blue-500 hover:text-blue-700 flex items-center">
                <Home className="mr-1 h-4 w-4" /> Back to Site
              </Link>
            </div>
          </div>
          <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
};

const AdminSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/listings">
                    <Car className="h-4 w-4 mr-2" />
                    <span>Car Listings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Messages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/blog">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Blog Management</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminLayout;
