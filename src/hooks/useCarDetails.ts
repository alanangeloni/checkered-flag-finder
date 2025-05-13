
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCarDetails = (idOrSlug?: string) => {
  const [carListing, setCarListing] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [relatedListings, setRelatedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      setError('No car ID or slug provided');
      return;
    }

    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        
        // Try to determine if the ID is a slug or UUID
        const isUuid = idOrSlug.includes('-');
        
        // Query using either slug or id
        const { data: car, error: carError } = await supabase
          .from('car_listings')
          .select(`
            *,
            images:car_images(*)
          `)
          .eq(isUuid ? 'id' : 'slug', idOrSlug)
          .single();

        if (carError) {
          console.error('Error fetching car listing:', carError);
          
          // If not found by UUID, try by slug
          if (isUuid) {
            const { data: carBySlug, error: slugError } = await supabase
              .from('car_listings')
              .select(`
                *,
                images:car_images(*)
              `)
              .eq('slug', idOrSlug)
              .single();
              
            if (slugError) {
              throw slugError;
            }
            
            setCarListing(carBySlug);
            
            // Process images to ensure we have the correct format
            const processedImages = carBySlug?.images?.map((img: any) => {
              // If image is already a string URL, return it as is
              if (typeof img === 'string') return img;
              // Otherwise extract the image_url property
              return img.image_url;
            }) || [];
            
            console.log('Car images from DB (slug):', carBySlug?.images);
            console.log('Processed images (slug):', processedImages);
            
            setImages(processedImages);
          } else {
            throw carError;
          }
        } else {
          setCarListing(car);
          
          // Process images to ensure we have the correct format
          const processedImages = car?.images?.map((img: any) => {
            // If image is already a string URL, return it as is
            if (typeof img === 'string') return img;
            // Otherwise extract the image_url property
            return img.image_url;
          }) || [];
          
          console.log('Car images from DB:', car?.images);
          console.log('Processed images:', processedImages);
          
          setImages(processedImages);
        }

        // Fetch related listings
        if (car?.category_id) {
          const { data: related, error: relatedError } = await supabase
            .from('car_listings')
            .select(`
              *,
              images:car_images(*)
            `)
            .eq('category_id', car.category_id)
            .neq('id', car.id)
            .eq('status', 'active')
            .limit(4);

          if (relatedError) {
            console.error('Error fetching related listings:', relatedError);
          } else {
            setRelatedListings(related || []);
          }
        }

      } catch (err: any) {
        console.error('Error in useCarDetails:', err);
        setError(err.message || 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [idOrSlug]);

  return { carListing, images, relatedListings, loading, error, isLoggedIn };
};
