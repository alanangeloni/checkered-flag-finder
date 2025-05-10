
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { MessageCircle, Share2, Heart, ChevronLeft, ChevronRight, Calendar, Clock, Star } from 'lucide-react';
import ContactSellerDialog from '@/components/ContactSellerDialog';
import { toast } from 'sonner';

// Mock data - in a real app this would come from an API
const mockCarData = {
  id: '1',
  title: 'F1 Race Car',
  price: '$25,000',
  bidEndsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
  highestBid: '$25,000',
  bids: 16,
  comments: 25,
  images: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1487887235947-a955ef187fcc',
    'https://images.unsplash.com/photo-1500673922987-e212871fec22',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888',
  ],
  description: 'This F1 race car is in excellent condition and ready for the track. It comes with a complete service history and has been maintained by professional mechanics.',
  details: {
    year: '2021',
    make: 'Formula',
    model: 'F1',
    mileage: '1,200 miles',
    vin: 'WPOAC29S27S71234',
    titleStatus: 'Clean',
    location: 'FL Lauderdale, FL 33809',
    engine: '4.0L Flat-6',
    drivetrain: 'Rear-wheel drive',
    transmission: 'Manual (6-Speed)',
    bodyStyle: 'Open Wheel',
    exteriorColor: 'Red',
    interiorColor: 'Black',
    category: 'Open Wheel',
    subcategory: 'Formula 1',
    sellerType: 'Private Party',
  },
  highlights: [
    'High-performance race engine',
    'Professional racing history',
    'Carbon fiber chassis and aerodynamics',
    'Recently serviced and track-ready',
    'Includes spare parts package'
  ],
  seller: {
    id: '123', // Added seller ID for the messaging feature
    name: 'John Smith',
    joinedDate: 'May 2023',
    listings: 5,
  }
};

const CarDetails = () => {
  const { id } = useParams();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % mockCarData.images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + mockCarData.images.length) % mockCarData.images.length);
  };
  
  const selectImage = (index: number) => {
    setActiveImageIndex(index);
  };

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    
    checkAuth();
  }, []);

  const handleContactClick = () => {
    if (!isLoggedIn) {
      toast.error('Please login to contact the seller');
      navigate('/login');
      return;
    }
    setIsContactModalOpen(true);
  };
  
  // Calculate time remaining
  const calculateTimeRemaining = () => {
    const now = new Date();
    const endTime = new Date(mockCarData.bidEndsAt);
    const diff = endTime.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} Days Left`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Title and bid info for mobile */}
        <div className="md:hidden mb-4">
          <h1 className="text-2xl font-bold">{mockCarData.title}</h1>
          <div className="flex justify-between items-center mt-2">
            <div className="text-lg font-bold text-racecar-red">{mockCarData.price}</div>
            <div className="text-sm text-gray-500">{calculateTimeRemaining()}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Image Gallery - 8 columns on large screens */}
          <div className="lg:col-span-8">
            <div className="flex flex-col md:flex-row gap-2">
              {/* Thumbnails - Vertical on desktop, horizontal on mobile */}
              <div className="md:order-1 order-2 flex md:flex-col flex-row overflow-x-auto md:overflow-y-auto md:h-[480px] gap-2 md:w-24">
                {mockCarData.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`cursor-pointer border-2 rounded-md overflow-hidden h-16 w-24 md:w-full shrink-0 ${index === activeImageIndex ? 'border-racecar-red' : 'border-transparent'}`}
                    onClick={() => selectImage(index)}
                  >
                    <img src={image} alt={`${mockCarData.title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              
              {/* Main Image */}
              <div className="relative rounded-lg overflow-hidden bg-gray-100 h-[300px] md:h-[480px] w-full md:order-2 order-1">
                <img 
                  src={mockCarData.images[activeImageIndex]} 
                  alt={mockCarData.title} 
                  className="w-full h-full object-cover"
                />
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
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                  {activeImageIndex + 1}/{mockCarData.images.length}
                </div>
              </div>
            </div>
            
            {/* Description and details */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line mb-6">{mockCarData.description}</p>

              <h2 className="text-xl font-bold mb-4">Highlights</h2>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                {mockCarData.highlights.map((highlight, index) => (
                  <li key={index} className="text-gray-700">{highlight}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Car details and contact - 4 columns on large screens */}
          <div className="lg:col-span-4">
            <Card className="shadow-md mb-6">
              <CardContent className="p-6">
                {/* Title and price - hidden on mobile (shown above) */}
                <div className="hidden md:block">
                  <h1 className="text-2xl font-bold mb-2">{mockCarData.title}</h1>
                  <p className="text-3xl font-bold text-racecar-red mb-4">{mockCarData.price}</p>
                </div>
                
                {/* Bid info */}
                <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-200 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Time Left</div>
                    <div className="font-semibold flex items-center justify-center gap-1">
                      <Clock size={14} /> {calculateTimeRemaining()}
                    </div>
                  </div>
                  <div className="text-center border-x border-gray-200">
                    <div className="text-sm text-gray-500">Highest Bid</div>
                    <div className="font-semibold">{mockCarData.highestBid}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Bids</div>
                    <div className="font-semibold">{mockCarData.bids}</div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-3 mb-6">
                  <Button 
                    className="flex-1 flex justify-center gap-2 bg-racecar-red hover:bg-red-700"
                    onClick={handleContactClick}
                  >
                    <MessageCircle size={18} /> Contact Seller
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <h3 className="font-semibold text-lg mb-3">Vehicle Details</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Make</TableCell>
                      <TableCell className="py-2">{mockCarData.details.make}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Model</TableCell>
                      <TableCell className="py-2">{mockCarData.details.model}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Year</TableCell>
                      <TableCell className="py-2">{mockCarData.details.year}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Mileage</TableCell>
                      <TableCell className="py-2">{mockCarData.details.mileage}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">VIN</TableCell>
                      <TableCell className="py-2">{mockCarData.details.vin}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Title Status</TableCell>
                      <TableCell className="py-2">{mockCarData.details.titleStatus}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Location</TableCell>
                      <TableCell className="py-2">{mockCarData.details.location}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Engine</TableCell>
                      <TableCell className="py-2">{mockCarData.details.engine}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Drivetrain</TableCell>
                      <TableCell className="py-2">{mockCarData.details.drivetrain}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Transmission</TableCell>
                      <TableCell className="py-2">{mockCarData.details.transmission}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Body Style</TableCell>
                      <TableCell className="py-2">{mockCarData.details.bodyStyle}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Exterior Color</TableCell>
                      <TableCell className="py-2">{mockCarData.details.exteriorColor}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="py-2 font-medium text-gray-500">Interior Color</TableCell>
                      <TableCell className="py-2">{mockCarData.details.interiorColor}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Separator className="my-4" />

                {/* Seller info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                      {mockCarData.seller.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{mockCarData.seller.name}</p>
                      <p className="text-xs text-gray-500">Member since {mockCarData.seller.joinedDate}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{mockCarData.seller.listings} listings</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Contact Seller Dialog */}
      <ContactSellerDialog
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        carId={id || '1'}
        carTitle={mockCarData.title}
        sellerId={mockCarData.seller.id}
      />
    </div>
  );
};

export default CarDetails;
