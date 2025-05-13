
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CarListingWithImages } from '@/types/customTypes';

const CarListingCard = ({ listing, index }: { listing: CarListingWithImages; index: number }) => {
  // Get the primary image or first available image
  const imageUrl = listing.images && listing.images.length > 0
    ? listing.images.find(img => img.is_primary)?.image_url || listing.images[0].image_url
    : 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'; // Fallback image
  
  return (
    <Link to={`/car-details/${listing.slug || listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img
            src={imageUrl}
            alt={listing.name}
            className="w-full h-44 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5';
              console.error('Image failed to load:', imageUrl);
            }}
          />
          <div className="absolute top-2 left-2 bg-white rounded px-3 py-1 font-bold">
            ${listing.price.toLocaleString()}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold mb-1">{listing.name}</h3>
          <div className="text-xs text-gray-600 space-x-1 mb-2">
            {[listing.make, listing.model, listing.year].filter(Boolean).map((detail, idx, arr) => (
              <React.Fragment key={idx}>
                <span>{detail}</span>
                {idx < arr.length - 1 && <span>•</span>}
              </React.Fragment>
            ))}
          </div>
          <p className="text-xs text-gray-600">{listing.location || 'Location not specified'}</p>
        </div>
      </Card>
    </Link>
  );
};

const RecentlyListedCars = () => {
  const [listings, setListings] = useState<CarListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        console.log('Fetching recently listed cars...');
        
        // First, try to get car listings without the relationship to images
        const { data: basicListings, error: basicError } = await supabase
          .from('car_listings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (basicError) {
          console.error('Error fetching basic listings:', basicError);
          throw basicError;
        }
        
        console.log('Successfully fetched basic car listings:', basicListings?.length || 0);
        
        // If we have basic listings, try to get their images separately
        if (basicListings && basicListings.length > 0) {
          const listingsWithImages = await Promise.all(
            basicListings.map(async (listing) => {
              try {
                const { data: images, error: imagesError } = await supabase
                  .from('car_images')
                  .select('*')
                  .eq('car_id', listing.id);
                
                if (imagesError) {
                  console.warn(`Error fetching images for car ${listing.id}:`, imagesError);
                  return { ...listing, images: [] };
                }
                
                return { ...listing, images: images || [] };
              } catch (err) {
                console.warn(`Error processing images for car ${listing.id}:`, err);
                return { ...listing, images: [] };
              }
            })
          );
          
          console.log('Successfully processed listings with images:', listingsWithImages.length);
          setListings(listingsWithImages as CarListingWithImages[]);
        } else {
          // No listings found
          setListings([]);
        }
      } catch (err) {
        console.error('Error in fetching car listings:', err);
        // Set empty listings to avoid showing loading state indefinitely
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Recently Listed Race Cars For Sale</h2>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="w-full h-44 bg-gray-200 animate-pulse"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 animate-pulse mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 animate-pulse mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-200 animate-pulse w-1/4"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing, index) => (
            <CarListingCard key={listing.id} listing={listing} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No car listings available at this time.</p>
        </div>
      )}
    </div>
  );
};

export default RecentlyListedCars;
