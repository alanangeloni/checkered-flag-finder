
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
import { toast } from 'sonner';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CarListing {
  id: string;
  name: string;
  make: string;
  model: string | null;
  price: number;
  user_id: string;
  status: string;
  created_at: string;
  featured: boolean;
  premium: boolean;
}

const AdminListingsManager = () => {
  const [listings, setListings] = useState<CarListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('car_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch car listings');
      console.error('Error fetching car listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('car_listings')
        .update({ featured: !currentValue })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Listing ${!currentValue ? 'featured' : 'unfeatured'} successfully`);
      fetchListings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update listing');
      console.error('Error updating listing:', error);
    }
  };

  const togglePremium = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('car_listings')
        .update({ premium: !currentValue })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Listing ${!currentValue ? 'marked as premium' : 'removed from premium'} successfully`);
      fetchListings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update listing');
      console.error('Error updating listing:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('car_listings')
          .delete()
          .eq('id', id);

        if (error) throw error;
        toast.success('Listing deleted successfully');
        fetchListings();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete listing');
        console.error('Error deleting listing:', error);
      }
    }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('car_listings')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Listing status changed to ${status}`);
      fetchListings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update listing status');
      console.error('Error updating listing status:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Car Listings</h2>
      </div>

      {isLoading ? (
        <p>Loading car listings...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Make/Model</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">No car listings found</TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell>{listing.name}</TableCell>
                  <TableCell>{listing.make} {listing.model}</TableCell>
                  <TableCell>${listing.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <select 
                      value={listing.status} 
                      onChange={(e) => changeStatus(listing.id, e.target.value)}
                      className="p-1 border rounded"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="sold">Sold</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={listing.featured ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFeatured(listing.id, listing.featured)}
                    >
                      {listing.featured ? 'Yes' : 'No'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={listing.premium ? "default" : "outline"}
                      size="sm"
                      onClick={() => togglePremium(listing.id, listing.premium)}
                    >
                      {listing.premium ? 'Yes' : 'No'}
                    </Button>
                  </TableCell>
                  <TableCell>{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/car-details/${listing.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(listing.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminListingsManager;
