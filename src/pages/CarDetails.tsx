
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCarDetails } from '@/hooks/useCarDetails';
import ContactSellerDialog from '@/components/ContactSellerDialog';
import { toast } from 'sonner';
import CarDetailsLoading from '@/components/car-details/CarDetailsLoading';
import CarDetailsError from '@/components/car-details/CarDetailsError';
import CarDetailsContent from '@/components/car-details/CarDetailsContent';
import { supabase } from '@/integrations/supabase/client';

const CarDetails = () => {
  const { id, slug } = useParams();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);
  const { carListing, relatedListings, loading, error, isLoggedIn, images } = useCarDetails(id || slug);

  // Handle URL format and redirection
  useEffect(() => {
    if (!loading && carListing && !redirected) {
      const carSlug = carListing.slug || carListing.name.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
      
      // If we're on the /car-details/:id/:slug route, redirect to /car-details/:slug
      if (id && slug && !isNaN(Number(id))) {
        navigate(`/car-details/${carSlug}`, { replace: true });
        setRedirected(true);
      }
      // If we're on the /car-details/:id route with a UUID, try to redirect to slug route
      else if (id && id.includes('-') && !slug) {
        navigate(`/car-details/${carSlug}`, { replace: true });
        setRedirected(true);
      }
    }
  }, [carListing, id, slug, navigate, loading, redirected]);

  // If no ID is provided but we have a slug, try to fetch by slug
  useEffect(() => {
    if (!id && slug && !carListing && !loading && !error) {
      const fetchCarBySlug = async () => {
        try {
          const { data, error } = await supabase
            .from('car_listings')
            .select('id')
            .eq('slug', slug)
            .single();
          
          if (data && !error) {
            window.location.href = `/car-details/${slug}`;
          }
        } catch (err) {
          console.error("Error fetching by slug:", err);
        }
      };
      
      fetchCarBySlug();
    }
  }, [id, slug, carListing, loading, error]);

  const handleContactClick = () => {
    if (!isLoggedIn) {
      toast.error('Please login to contact the seller');
      navigate('/login');
      return;
    }
    setIsContactModalOpen(true);
  };

  if (loading) {
    return <CarDetailsLoading />;
  }

  if (error || !carListing) {
    return <CarDetailsError error={error} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <CarDetailsContent
          carListing={carListing}
          images={images}
          relatedListings={relatedListings}
          id={carListing.id || ''}
          onContactClick={handleContactClick}
        />
      </main>
      <Footer />
      
      {/* Contact Seller Dialog */}
      <ContactSellerDialog
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        carId={carListing.id || ''}
        carTitle={carListing?.name || ''}
        sellerId={carListing?.user_id || ''}
      />
    </div>
  );
};

export default CarDetails;
