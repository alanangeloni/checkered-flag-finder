
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCarDetails } from '@/hooks/useCarDetails';
import ContactSellerDialog from '@/components/ContactSellerDialog';
import { toast } from 'sonner';
import CarDetailsLoading from '@/components/car-details/CarDetailsLoading';
import CarDetailsError from '@/components/car-details/CarDetailsError';
import CarDetailsContent from '@/components/car-details/CarDetailsContent';

const CarDetails = () => {
  const { id } = useParams();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const navigate = useNavigate();
  const { carListing, relatedListings, loading, error, isLoggedIn, images } = useCarDetails(id);

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
          id={id || ''}
          onContactClick={handleContactClick}
        />
      </main>
      <Footer />
      
      {/* Contact Seller Dialog */}
      <ContactSellerDialog
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        carId={id || ''}
        carTitle={carListing?.name || ''}
        sellerId={carListing?.user_id || ''}
      />
    </div>
  );
};

export default CarDetails;
