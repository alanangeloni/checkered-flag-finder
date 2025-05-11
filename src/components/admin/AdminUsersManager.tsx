
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
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Eye, Pencil } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  email?: string;
}

const AdminUsersManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Fetch profiles from the profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      
      // Fetch emails from the auth.users table via an admin function (this would require a proxy in production)
      // For this example, we'll populate emails with placeholder values
      // In a real implementation, you might need a custom API endpoint or Supabase function
      
      // Combine the data
      const usersWithEmail = profiles?.map((profile: UserProfile) => ({
        ...profile,
        email: `user_${profile.id.substring(0, 8)}@example.com`, // This is a placeholder
      })) || [];
      
      setUsers(usersWithEmail);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openUserDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setEditedUser({
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      is_admin: user.is_admin,
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editedUser.username,
          full_name: editedUser.full_name,
          avatar_url: editedUser.avatar_url,
          is_admin: editedUser.is_admin
        })
        .eq('id', selectedUser.id);

      if (error) throw error;
      
      toast.success('User profile updated successfully');
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
      console.error('Error updating user:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Users</h2>
      </div>

      {isLoading ? (
        <p>Loading users...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No users found</TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username || 'N/A'}</TableCell>
                  <TableCell>{user.full_name || 'N/A'}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.is_admin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openUserDialog(user)}>
                      <Pencil className="h-4 w-4" />
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
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username">Username</label>
                <Input 
                  id="username" 
                  name="username" 
                  value={editedUser.username || ''} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="full_name">Full Name</label>
                <Input 
                  id="full_name" 
                  name="full_name" 
                  value={editedUser.full_name || ''} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="avatar_url">Avatar URL</label>
                <Input 
                  id="avatar_url" 
                  name="avatar_url" 
                  value={editedUser.avatar_url || ''} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="is_admin" 
                  name="is_admin" 
                  checked={editedUser.is_admin} 
                  onChange={handleInputChange}
                  className="h-4 w-4" 
                />
                <label htmlFor="is_admin">Administrator</label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateUser}>Update User</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersManager;
