
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Shield, ShieldAlert, ShieldCheck, ShieldX, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Profile } from '@/types/customTypes';

const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setUsers(data || []);
        setFilteredUsers(data || []);
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
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleUserEdit = (user: Profile) => {
    setSelectedUser(user);
    setIsAdmin(user.is_admin || false);
    setDialogOpen(true);
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? { ...user, is_admin: isAdmin } 
            : user
        )
      );
      
      toast.success("User updated successfully");
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Error updating user");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <div className="mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
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
                <TableHead>Role</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading users...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">No users found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username || ''} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-gray-500 text-sm font-bold">
                              {(user.username && user.username[0]) || (user.full_name && user.full_name[0]) || 'U'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{user.full_name || 'Unnamed'}</p>
                          <p className="text-xs text-gray-500">@{user.username || 'no-username'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || 'No email'}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <div className="flex items-center">
                          <ShieldCheck className="h-4 w-4 text-green-600 mr-1" />
                          <span>Admin</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-gray-400 mr-1" />
                          <span>User</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleUserEdit(user)}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt={selectedUser.username || ''} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-500 text-sm font-bold">
                        {(selectedUser.username && selectedUser.username[0]) || 
                         (selectedUser.full_name && selectedUser.full_name[0]) || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedUser.full_name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-500">@{selectedUser.username || 'no-username'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox 
                    id="is-admin" 
                    checked={isAdmin}
                    onCheckedChange={() => setIsAdmin(!isAdmin)}
                  />
                  <label 
                    htmlFor="is-admin"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Admin Access
                  </label>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveUserChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
