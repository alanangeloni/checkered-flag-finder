
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };

    getUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-racecar-lightgray">
        <Header />
        <div className="container mx-auto py-16 px-4">
          <p>Loading...</p>
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
            <CardTitle className="text-3xl">My Profile</CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
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

            <div className="grid gap-4 pt-6 border-t">
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
                <Button variant="outline">Change Password</Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700">Delete Account</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
