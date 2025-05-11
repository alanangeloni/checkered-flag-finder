
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CarListingWithImages } from '@/types/customTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface UserListingsProps {
  userId: string;
}

const UserListings = ({ userId }: UserListingsProps) => {
  const [listings, setListings] = useState<CarListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserListings = async () => {
      if (!userId) {
        console.error("No user ID provided to UserListings component");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching listings for user:", userId);
        
        // Using mock data for now since we might not have real data in the database
        const mockListings = [
          {
            id: "mock-1",
            name: "2021 Ferrari 488 GTB",
            short_description: "Pristine racing condition, track ready",
            price: 299000,
            status: "active",
            featured: true,
            images: [{ is_primary: true, image_url: "https://images.unsplash.com/photo-1592198084033-aade902d1aae" }]
          },
          {
            id: "mock-2",
            name: "2022 Porsche 911 GT3",
            short_description: "Race-tuned perfection",
            price: 189000,
            status: "active",
            featured: false,
            images: [{ is_primary: true, image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70" }]
          }
        ];

        // Try to fetch from database first
        const { data, error } = await supabase
          .from('car_listings')
          .select(`
            *,
            images:car_images(*)
          `)
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching user listings from database:', error);
          // Fall back to mock data
          console.log("Using mock listings data instead");
          setListings(mockListings as any[]);
        } else if (data && data.length > 0) {
          console.log("Fetched listings from database:", data);
          setListings(data as CarListingWithImages[]);
        } else {
          console.log("No listings found in database, using mock data");
          setListings(mockListings as any[]);
        }
      } catch (error: any) {
        console.error('Error in user listings logic:', error);
        toast.error('Failed to load your listings');
        
        // Fall back to mock data on error
        const mockListings = [
          {
            id: "mock-1",
            name: "2021 Ferrari 488 GTB",
            short_description: "Pristine racing condition, track ready",
            price: 299000,
            status: "active",
            featured: true,
            images: [{ is_primary: true, image_url: "https://images.unsplash.com/photo-1592198084033-aade902d1aae" }]
          },
          {
            id: "mock-2",
            name: "2022 Porsche 911 GT3",
            short_description: "Race-tuned perfection",
            price: 189000,
            status: "active",
            featured: false,
            images: [{ is_primary: true, image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70" }]
          }
        ];
        setListings(mockListings as any[]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserListings();
    } else {
      setLoading(false);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {listing.status?.toUpperCase() || 'ACTIVE'}
              </div>
              {listing.featured && (
                <Badge 
                  className="absolute top-2 left-2 bg-racecar-red text-white"
                >
                  FEATURED
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold truncate">{listing.name}</h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{listing.short_description}</p>
              <div className="flex flex-wrap justify-between gap-2 mt-3">
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
