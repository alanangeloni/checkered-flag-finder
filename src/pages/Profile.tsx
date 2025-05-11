
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserListings from '@/components/UserListings';
import UserMessages from '@/components/UserMessages';
import { Skeleton } from '@/components/ui/skeleton';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error('Please login to view your profile');
          navigate('/login');
          return;
        }
        
        setUser(session.user);
      } catch (error) {
        console.error('Error fetching session:', error);
        toast.error('Failed to load profile data');
        navigate('/login');
      } finally {
        // Always set loading to false, even if there's an error
        setLoading(false);
      }
    };

    getUser();

    // Set up auth state listener to handle session changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/login');
        } else if (session) {
          setUser(session.user);
          setLoading(false);
        }
      }
    );

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleChangePassword = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    // This would typically require backend support through Supabase Edge Functions
    // For now, we'll just show a toast notification
    toast.error('Account deletion requires admin action. Please contact support.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-racecar-lightgray">
        <Header />
        <div className="container mx-auto py-16 px-4">
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6 mb-6">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="space-y-6">
                <Skeleton className="h-10 w-full max-w-md" />
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-racecar-lightgray">
      <Header />
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">My Profile</CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6 mb-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl">
                  {user?.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-medium">{user?.email}</h3>
                <p className="text-gray-500">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="listings">My Listings</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-6">
                <div className="grid gap-4 border-t pt-6">
                  <h4 className="font-medium text-lg">Account Information</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p>{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">User ID</p>
                      <p className="text-sm">{user?.id}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 pt-6 border-t">
                  <h4 className="font-medium text-lg">Account Actions</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="outline" onClick={handleChangePassword}>Change Password</Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="listings">
                {user && <UserListings userId={user.id} />}
              </TabsContent>
              
              <TabsContent value="messages">
                {user && <UserMessages userId={user.id} />}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
