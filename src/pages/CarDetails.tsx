
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { MessageCircle, Share2, Heart, ChevronLeft, ChevronRight, Tag, FileText, User } from 'lucide-react';
import ContactSellerDialog from '@/components/ContactSellerDialog';
import { toast } from 'sonner';
import { CarListingWithImages } from '@/types/customTypes';

const CarDetails = () => {
  const { id } = useParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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

  const nextImage = () => {
    if (!carListing?.images || carListing.images.length === 0) return;
    setActiveImageIndex((prev) => (prev + 1) % carListing.images.length);
  };

  const prevImage = () => {
    if (!carListing?.images || carListing.images.length === 0) return;
    setActiveImageIndex((prev) => (prev - 1 + carListing.images.length) % carListing.images.length);
  };
  
  const selectImage = (index: number) => {
    setActiveImageIndex(index);
  };

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
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error || 'Car listing not found'}</p>
              <Button onClick={() => navigate('/listings')}>
                View All Listings
              </Button>
            </CardContent>
          </Card>
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
            {/* Main Image Gallery */}
            <div className="mb-6">
              <div className="flex gap-4">
                {/* Large Main Image */}
                <div className="flex-grow">
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 h-[500px] w-full">
                    {images.length > 0 ? (
                      <img 
                        src={images[activeImageIndex]} 
                        alt={carListing.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <p className="text-gray-500">No image available</p>
                      </div>
                    )}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                          aria-label="Next image"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                    {carListing.featured && (
                      <div className="absolute top-2 left-2 bg-black/50 text-white px-3 py-1 rounded-md text-xs">
                        FEATURED
                      </div>
                    )}
                    {images.length > 0 && (
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                        {activeImageIndex + 1}/{images.length}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Thumbnails Grid - Right Side Column */}
                {images.length > 0 && (
                  <div className="hidden md:grid grid-rows-6 gap-2 w-[180px]">
                    {images.slice(0, 6).map((image, index) => (
                      <div 
                        key={index}
                        className={`cursor-pointer rounded-md overflow-hidden h-[80px] ${index === activeImageIndex ? 'ring-2 ring-racecar-red' : ''}`}
                        onClick={() => selectImage(index)}
                      >
                        <img src={image} alt={`${carListing.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        {index === 5 && images.length > 6 && (
                          <div className="absolute right-2 bottom-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                            All Photos ({images.length})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Mobile Thumbnails Grid - Below Main Image */}
              {images.length > 0 && (
                <div className="grid grid-cols-6 gap-2 mt-2 md:hidden">
                  {images.map((image, index) => (
                    <div 
                      key={index}
                      className={`cursor-pointer rounded-md overflow-hidden h-16 ${index === activeImageIndex ? 'ring-2 ring-racecar-red' : ''}`}
                      onClick={() => selectImage(index)}
                    >
                      <img src={image} alt={`${carListing.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Price and Contact Info Bar */}
            <Card className="mb-6 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="font-semibold text-xl">${carListing.price?.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Racing Class</div>
                        <div className="font-semibold">{carListing.race_car_type || 'N/A'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Seller Type</div>
                        <div className="font-semibold">{carListing.seller_type || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      variant="primary"
                      className="w-full sm:w-auto"
                      onClick={handleContactClick}
                    >
                      <MessageCircle size={18} />
                      Contact Seller
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mt-4 text-right">
                  Listed on {new Date(carListing.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
            
            {/* Vehicle Specifications Table */}
            <Card className="mb-6 shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="border-b md:border-b-0 md:border-r border-gray-200">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Make</TableCell>
                        <TableCell className="py-2">{carListing.make}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Model</TableCell>
                        <TableCell className="py-2">{carListing.model || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Year</TableCell>
                        <TableCell className="py-2">{carListing.year || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Engine Hours</TableCell>
                        <TableCell className="py-2">{carListing.engine_hours || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Engine Specs</TableCell>
                        <TableCell className="py-2">{carListing.engine_specs || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Category</TableCell>
                        <TableCell className="py-2">{carListing.category_name || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Subcategory</TableCell>
                        <TableCell className="py-2">{carListing.subcategory_name || 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Race Car Type</TableCell>
                        <TableCell className="py-2">{carListing.race_car_type || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Drivetrain</TableCell>
                        <TableCell className="py-2">{carListing.drivetrain || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Transmission</TableCell>
                        <TableCell className="py-2">{carListing.transmission || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Weight</TableCell>
                        <TableCell className="py-2">{carListing.weight || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Safety Equipment</TableCell>
                        <TableCell className="py-2">{carListing.safety_equipment || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Suspension</TableCell>
                        <TableCell className="py-2">{carListing.suspension || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Brakes</TableCell>
                        <TableCell className="py-2">{carListing.brakes || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Location</TableCell>
                        <TableCell className="py-2">{carListing.location || 'N/A'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
            
            {/* Description */}
            <Card className="shadow-sm mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{carListing.detailed_description || carListing.short_description}</p>
              </CardContent>
            </Card>

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
