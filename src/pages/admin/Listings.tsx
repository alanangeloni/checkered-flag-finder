
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Edit, Trash, Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface CarListing {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  price: number;
  created_at: string;
  status: string;
  user_id: string;
  profile?: {
    full_name: string;
    username: string;
  };
}

const AdminListings = () => {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredListings, setFilteredListings] = useState<CarListing[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('car_listings')
          .select(`
            *,
            profile:profiles(full_name, username)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setListings(data || []);
        setFilteredListings(data || []);
      } catch (error: any) {
        console.error("Error fetching listings:", error);
        toast.error(error.message || "Error fetching listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    const results = listings.filter(listing =>
      listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (listing.model && listing.model.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredListings(results);
  }, [searchTerm, listings]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('car_listings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setListings(prevListings => 
        prevListings.map(listing => 
          listing.id === id ? { ...listing, status: newStatus } : listing
        )
      );
      
      toast.success(`Listing status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Error updating status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('car_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      setListings(prevListings => prevListings.filter(listing => listing.id !== id));
      toast.success("Listing deleted successfully");
    } catch (error: any) {
      console.error("Error deleting listing:", error);
      toast.error(error.message || "Error deleting listing");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Car Listings Management</h1>
      
      <div className="mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search listings..."
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
                <TableHead>Title</TableHead>
                <TableHead>Make/Model</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Date Listed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading listings...</TableCell>
                </TableRow>
              ) : filteredListings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No car listings found</TableCell>
                </TableRow>
              ) : (
                filteredListings.map(listing => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">{listing.name}</TableCell>
                    <TableCell>
                      {listing.make} {listing.model} {listing.year && `(${listing.year})`}
                    </TableCell>
                    <TableCell>${listing.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(listing.status)}`}>
                        {listing.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {listing.profile?.full_name || listing.profile?.username || "Unknown"}
                    </TableCell>
                    <TableCell>
                      {new Date(listing.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/car-details/${listing.id}`} target="_blank">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusChange(listing.id, listing.status === 'active' ? 'rejected' : 'active')}
                          className={listing.status === 'active' ? 'text-red-500' : 'text-green-500'}
                        >
                          {listing.status === 'active' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(listing.id)}>
                          <Trash className="h-4 w-4" />
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

export default AdminListings;
