
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CarListingWithImages } from '@/types/customTypes';
import { mockCarListings } from '@/pages/CarDetails';

const CarSidebar = ({ currentCarId }: { currentCarId: string | undefined }) => {
  const [listings, setListings] = useState<CarListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        
        // For demo, if we're viewing a mock listing, show other mock listings
        if (currentCarId && /^\d+$/.test(currentCarId)) {
          // Filter out the current car from mock listings
          const mockIds = Object.keys(mockCarListings);
          const otherMockListings = mockIds
            .filter(id => id !== currentCarId)
            .map(id => mockCarListings[id]);
          
          // Take just 5 mock listings
          setListings(otherMockListings.slice(0, 5) as CarListingWithImages[]);
          setLoading(false);
          return;
        }
        
        // If we're viewing a real listing, fetch real listings from the database
        const { data, error } = await supabase
          .from('car_listings')
          .select(`
            *,
            images:car_images(*),
            category:categories(name),
            subcategory:subcategories(name)
          `)
          .eq('status', 'active')
          .limit(5);
        
        if (error) throw error;
        
        // Format the data and filter out current car
        const formattedData = data.filter(car => car.id !== currentCarId).map(car => ({
          ...car,
          category_name: car.category?.name,
          subcategory_name: car.subcategory?.name,
          primary_image: car.images && car.images.length > 0 
            ? car.images.find(img => img.is_primary)?.image_url || car.images[0].image_url
            : null
        }));
        
        setListings(formattedData as CarListingWithImages[]);
      } catch (error) {
        console.error('Error fetching sidebar listings:', error);
        // Fallback to mock data if there's an error
        const mockIds = Object.keys(mockCarListings);
        const otherMockListings = mockIds
          .filter(id => id !== currentCarId)
          .map(id => mockCarListings[id]);
        setListings(otherMockListings.slice(0, 5) as CarListingWithImages[]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [currentCarId]);
  
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-medium mb-4">More Listings</h3>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">More Listings</h3>
      <div className="space-y-4">
        {listings.map(listing => (
          <Link 
            key={listing.id} 
            to={`/car-details/${listing.id}`} 
            className="block group"
          >
            <div className="border rounded-md overflow-hidden hover:border-primary transition-colors">
              <div className="relative h-32 bg-gray-100">
                {listing.images && listing.images.length > 0 ? (
                  <img 
                    src={listing.images.find(img => img.is_primary)?.image_url || listing.images[0].image_url} 
                    alt={listing.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 bg-white text-black font-bold px-2 py-1 m-2 text-xs rounded">
                  ${listing.price.toLocaleString()}
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {listing.name}
                </h4>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {listing.race_car_type && (
                    <Badge variant="destructive" className="text-xs">{listing.race_car_type}</Badge>
                  )}
                  {listing.category_name && (
                    <Badge variant="outline" className="text-xs">{listing.category_name}</Badge>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
        <div className="text-center pt-2">
          <Link 
            to="/listings" 
            className="text-sm text-primary hover:underline font-medium"
          >
            View All Listings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarSidebar;
