
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CarListingWithImages } from '@/types/customTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UserListingsProps {
  userId: string;
}

const UserListings = ({ userId }: UserListingsProps) => {
  const [listings, setListings] = useState<CarListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const { data, error } = await supabase
          .from('car_listings')
          .select(`
            *,
            images:car_images(*)
          `)
          .eq('user_id', userId);

        if (error) throw error;

        setListings(data as CarListingWithImages[] || []);
      } catch (error: any) {
        console.error('Error fetching user listings:', error);
        toast.error('Failed to load your listings');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserListings();
    }
  }, [userId]);

  if (loading) {
    return <div className="py-4">Loading your listings...</div>;
  }

  if (listings.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-gray-500 mb-4">You haven't listed any cars yet.</p>
        <Link to="/list-car">
          <Button>List Your Car</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Your Listings</h3>
        <Link to="/list-car">
          <Button variant="outline" size="sm">+ New Listing</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden">
            <div className="relative h-40">
              {listing.images && listing.images.length > 0 ? (
                <img 
                  src={listing.images.find(img => img.is_primary)?.image_url || listing.images[0].image_url} 
                  alt={listing.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No Image</p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 bg-white text-black font-bold px-2 py-1 m-2 text-sm rounded">
                ${listing.price.toLocaleString()}
              </div>
              <div className={`absolute top-0 right-0 px-2 py-1 m-2 text-xs rounded ${
                listing.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }`}>
                {listing.status.toUpperCase()}
              </div>
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold truncate">{listing.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{listing.short_description}</p>
              <div className="flex justify-between mt-3">
                <Link to={`/car-details/${listing.id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                <Link to={`/edit-listing/${listing.id}`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserListings;
