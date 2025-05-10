
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CarListingWithImages } from '@/types/customTypes';
import { supabase } from '@/integrations/supabase/client';

const HeroSection = () => {
  const [premiumListing, setPremiumListing] = useState<CarListingWithImages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPremiumListing = async () => {
      try {
        setIsLoading(true);
        
        // Query for premium cars with their images
        const { data, error } = await supabase
          .from('car_listings')
          .select(`
            *,
            images:car_images(*)
          `)
          .eq('premium', true)
          .eq('status', 'active') // Only active listings
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

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
  const fallbackSmallImages = [
    "https://images.unsplash.com/photo-1597516690807-65bfba6a1204",
    "https://images.unsplash.com/photo-1574697489276-12929b6571bd",
    "https://images.unsplash.com/photo-1581680395170-5e321f9f0a7e",
    "https://images.unsplash.com/photo-1588127333419-b9d7de223dcf"
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Featured Premium Listing</h2>
        <p className="text-gray-600">Explore our finest racing car available</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Main large image - fixed height to match grid */}
        <div className="md:w-3/5 relative group h-full">
          <Link to={premiumListing ? `/car-details/${premiumListing.id}` : "/listings"}>
            <div className="relative rounded-md overflow-hidden h-full">
              <img 
                src={premiumListing?.primary_image || fallbackMainImage} 
                alt={premiumListing?.name || "Premium race car on track"} 
                className="rounded-md w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ aspectRatio: "1/1", objectFit: "cover" }}
              />
              {premiumListing && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <h3 className="text-xl md:text-2xl font-bold">{premiumListing.name}</h3>
                  <p className="text-lg md:text-xl font-bold mt-1">${premiumListing.price.toLocaleString()}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-sm">{premiumListing.location || 'Location available upon request'}</span>
                    <Button variant="outline" className="ml-auto text-white border-white hover:bg-white hover:text-black">
                      View Details
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Premium badge */}
              <div className="absolute top-4 right-4 bg-yellow-500 text-black font-bold px-3 py-1 rounded-full">
                PREMIUM
              </div>
            </div>
          </Link>
        </div>
        
        {/* Right side with 4 smaller images - made explicitly same height as left side */}
        <div className="md:w-2/5 h-full">
          {/* 2x2 grid of smaller images */}
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Top row */}
            <div className="aspect-square">
              <img 
                src={fallbackSmallImages[0]} 
                alt="Race car angle view" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square">
              <img 
                src={fallbackSmallImages[1]} 
                alt="Race car rear view" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
            
            {/* Bottom row */}
            <div className="aspect-square">
              <img 
                src={fallbackSmallImages[2]} 
                alt="Race car engine" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square">
              <img 
                src={fallbackSmallImages[3]} 
                alt="Race car cockpit" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
