
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Share2, Heart } from 'lucide-react';
import ContactSellerDialog from '@/components/ContactSellerDialog';
import { toast } from 'sonner';
import { CarListingWithImages } from '@/types/customTypes';
import CarImageGallery from '@/components/car-details/CarImageGallery';
import CarPriceInfo from '@/components/car-details/CarPriceInfo';
import CarSpecifications from '@/components/car-details/CarSpecifications';
import CarDescription from '@/components/car-details/CarDescription';

const CarDetails = () => {
  const { id } = useParams();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [carListing, setCarListing] = useState<CarListingWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);

        // Fetch car details
        const { data: carData, error: carError } = await supabase
          .from('car_listings')
          .select(`
            *,
            images:car_images(*),
            category:categories(name),
            subcategory:subcategories(name)
          `)
          .eq('id', id)
          .single();

        if (carError) throw carError;
        
        if (!carData) {
          setError('Car listing not found');
          setCarListing(null);
        } else {
          // Format the data
          const formattedCar = {
            ...carData,
            category_name: carData.category?.name,
            subcategory_name: carData.subcategory?.name,
            primary_image: carData.images && carData.images.length > 0 
              ? carData.images.find((img: any) => img.is_primary)?.image_url || carData.images[0].image_url
              : null
          };
          
          setCarListing(formattedCar as CarListingWithImages);
        }
      } catch (err: any) {
        console.error('Error fetching car details:', err);
        setError(err.message || 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  const handleContactClick = () => {
    if (!isLoggedIn) {
      toast.error('Please login to contact the seller');
      navigate('/login');
      return;
    }
    setIsContactModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-racecar-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading car details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !carListing) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Car listing not found'}</p>
            <Button onClick={() => navigate('/listings')}>
              View All Listings
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Extract images from the car listing
  const images = carListing.images && carListing.images.length > 0 
    ? carListing.images.map(img => img.image_url)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Title and subtitle */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">{carListing.name}</h1>
          <p className="text-gray-600">{carListing.short_description}</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Main Content Area */}
          <div>
            {/* Image Gallery Component */}
            <CarImageGallery 
              images={images} 
              carName={carListing.name} 
              isFeatured={carListing.featured} 
            />
            
            {/* Price and Contact Info Component */}
            <CarPriceInfo 
              price={carListing.price || 0}
              raceCarType={carListing.race_car_type}
              sellerType={carListing.seller_type}
              createdAt={carListing.created_at}
              onContactClick={handleContactClick}
            />
            
            {/* Vehicle Specifications Component */}
            <CarSpecifications carListing={carListing} />
            
            {/* Description Component */}
            <CarDescription 
              detailedDescription={carListing.detailed_description}
              shortDescription={carListing.short_description}
            />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Contact Seller Dialog */}
      <ContactSellerDialog
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        carId={id || ''}
        carTitle={carListing.name}
        sellerId={carListing.user_id}
      />
    </div>
  );
};

export default CarDetails;
