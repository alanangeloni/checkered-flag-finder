
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, UserX, Car, MessageSquare, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  created_at: string;
  full_name: string | null;
  username: string | null;
  email: string;
  is_admin: boolean;
  avatar_url: string | null;
  listings_count: number;
  messages_count: number;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // First get all profiles from the database
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) throw profilesError;
        
        // Get the corresponding auth users for these profiles
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) throw authError;
        
        // For each profile, count their listings and messages
        const usersWithCounts = await Promise.all(profiles.map(async (profile) => {
          // Get user email from auth users
          const authUser = authUsers.users.find(user => user.id === profile.id);
          const email = authUser ? authUser.email : 'no-email';
          
          // Count listings
          const { count: listingsCount } = await supabase
            .from('car_listings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);
          
          // Count messages
          const { count: messagesSentCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', profile.id);
          
          const { count: messagesReceivedCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', profile.id);
          
          return {
            ...profile,
            email,
            listings_count: listingsCount || 0,
            messages_count: (messagesSentCount || 0) + (messagesReceivedCount || 0)
          };
        }));
        
        setUsers(usersWithCounts);
        setFilteredUsers(usersWithCounts);
      } catch (error: any) {
        console.error("Error fetching users:", error);
        toast.error(error.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const results = users.filter(user =>
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const toggleAdminStatus = async (id: string, isCurrentlyAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isCurrentlyAdmin })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id ? { ...user, is_admin: !isCurrentlyAdmin } : user
        )
      );
      
      toast.success(`User ${!isCurrentlyAdmin ? 'promoted to admin' : 'removed from admin role'}`);
    } catch (error: any) {
      console.error("Error updating admin status:", error);
      toast.error(error.message || "Error updating admin status");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <div className="mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
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
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading users...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No users found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.full_name 
                              ? user.full_name.substring(0, 2).toUpperCase() 
                              : user.username 
                                ? user.username.substring(0, 2).toUpperCase()
                                : user.email.substring(0, 2).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || user.username || "Unnamed User"}</div>
                          <div className="text-xs text-gray-500">{user.username || ""}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">Admin</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">User</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-3">
                        <div className="flex items-center text-xs">
                          <Car className="h-3 w-3 mr-1 text-blue-500" />
                          <span>{user.listings_count}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <MessageSquare className="h-3 w-3 mr-1 text-green-500" />
                          <span>{user.messages_count}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          className={user.is_admin ? "text-red-500" : "text-green-500"}
                        >
                          {user.is_admin ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              <span>Remove Admin</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              <span>Make Admin</span>
                            </>
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
    </div>
  );
};

export default AdminUsers;
