import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CarListingWithImages } from '@/types/customTypes';
import { supabase } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import CarImageGallery from '@/components/car-details/CarImageGallery';
const HeroSection = () => {
  const [premiumListing, setPremiumListing] = useState<CarListingWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchPremiumListing = async () => {
      try {
        setIsLoading(true);

        // Query for premium cars with their images
        const {
          data,
          error
        } = await supabase.from('car_listings').select(`
            *,
            images:car_images(*)
          `).eq('premium', true).eq('status', 'active') // Only active listings
        .order('created_at', {
          ascending: false
        }).limit(1).single();
        if (error) throw error;

        // Find primary image or use first image
        if (data) {
          const primaryImage = data.images.find((img: any) => img.is_primary) || data.images[0];
          setPremiumListing({
            ...data,
            primary_image: primaryImage?.image_url
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch premium listing:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPremiumListing();
  }, []);

  // Fallback images if no database data is available
  const fallbackMainImage = "public/lovable-uploads/18c37c28-d61b-42ff-bd39-e4afa0cf3d33.png";
  const fallbackSmallImages = ["https://images.unsplash.com/photo-1597516690807-65bfba6a1204", "https://images.unsplash.com/photo-1574697489276-12929b6571bd", "https://images.unsplash.com/photo-1581680395170-5e321f9f0a7e", "https://images.unsplash.com/photo-1588127333419-b9d7de223dcf"];
  return <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        
        
      </div>
      
      <div className="mb-6">
        {premiumListing ? (
          <Link to={`/car-details/${premiumListing.id}`}>
            <CarImageGallery
              images={premiumListing.images?.map((img: any) => img.image_url) || [fallbackMainImage, ...fallbackSmallImages]}
              carName={premiumListing.name}
              isFeatured={true}
              listingDetails={
                <>
                  <div className="text-xl md:text-2xl font-bold text-white mb-0 leading-tight">{premiumListing.name}</div>
                  <div className="text-lg md:text-xl font-bold text-racecar-red mb-0">${premiumListing.price.toLocaleString()}</div>
                  <div className="text-xs md:text-sm text-white/80 font-normal">{premiumListing.location || 'Location available upon request'}</div>
                </>
              }
            />

          </Link>
        ) : (
          <CarImageGallery
            images={[fallbackMainImage, ...fallbackSmallImages]}
            carName="Premium Listing"
            isFeatured={true}
          />
        )}
      </div>
    </div>;
};
export default HeroSection;