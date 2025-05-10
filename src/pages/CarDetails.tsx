
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { MessageCircle, Share2, Heart, ChevronLeft, ChevronRight, Clock, Tag, FileText, User } from 'lucide-react';
import ContactSellerDialog from '@/components/ContactSellerDialog';
import { toast } from 'sonner';

// Mock data - in a real app this would come from an API
const mockCarData = {
  id: '1',
  title: '2024 Porsche 911 GT3',
  subtitle: '~2,800 Miles, 6-Speed Manual, 502-hp Flat-6, Guards Red, Unmodified',
  price: '$25,000',
  bidEndsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
  highestBid: '$25,000',
  bids: 16,
  comments: 25,
  endingDate: 'May 14th at 1:30 PM EDT',
  images: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1487887235947-a955ef187fcc',
    'https://images.unsplash.com/photo-1500673922987-e212871fec22',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888',
  ],
  description: "This Porsche 911 GT3 is in excellent condition and ready for the track. It comes with a complete service history and has been maintained by professional mechanics.",
  details: {
    year: '2024',
    make: 'Porsche',
    model: '911 GT3',
    mileage: '2,800 miles',
    vin: 'WPOAC29S27S71234',
    titleStatus: 'Clean',
    location: 'FL Lauderdale, FL 33809',
    engine: '4.0L Flat-6',
    drivetrain: 'Rear-wheel drive',
    transmission: 'Manual (6-Speed)',
    bodyStyle: 'Coupe',
    exteriorColor: 'Guards Red',
    interiorColor: 'Black',
    category: 'Sports Car',
    subcategory: 'Performance',
    sellerType: 'Private Party',
  },
  highlights: [
    'High-performance sports car',
    'Professional maintenance history',
    'Guards Red exterior',
    'Recently serviced and track-ready',
    'Includes spare parts package'
  ],
  seller: {
    id: '123',
    name: 'John Smith',
    joinedDate: 'May 2023',
    listings: 5,
    username: 'mark82'
  },
  sellerNotes: "This Porsche 911 GT3 is one of the most exhilarating sports cars in the market, blending a thrilling driving character with exceptional performance and a high-revving naturally aspirated engine. This particular car is fitted with the incredibly desirable 6-speed manual transmission, and it's finished in eye-catching Guards Red. It also touts a front axle lift system, Ceramic Composite Brakes, 20-inch front and 21-inch rear wheels, and a Bose surround sound system. Other benefits include low mileage and no modifications. Plus, this car comes with a clean, accident-free Carfax report, further adding to the appeal."
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
    return `${days} Days`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Title and subtitle */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">{mockCarData.title}</h1>
          <p className="text-gray-600">{mockCarData.subtitle}</p>
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
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-3 py-1 rounded-md text-xs">
                      FEATURED
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
                      {activeImageIndex + 1}/{mockCarData.images.length}
                    </div>
                  </div>
                </div>
                
                {/* Thumbnails Grid - Right Side Column */}
                <div className="hidden md:grid grid-rows-6 gap-2 w-[180px]">
                  {mockCarData.images.slice(0, 6).map((image, index) => (
                    <div 
                      key={index}
                      className={`cursor-pointer rounded-md overflow-hidden h-[80px] ${index === activeImageIndex ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => selectImage(index)}
                    >
                      <img src={image} alt={`${mockCarData.title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-black/50 text-white px-2 py-0.5 rounded text-xs">
                          Exterior (34)
                        </div>
                      )}
                      {index === 4 && (
                        <div className="absolute top-1 left-1 bg-black/50 text-white px-2 py-0.5 rounded text-xs">
                          Interior (49)
                        </div>
                      )}
                      {index === 5 && (
                        <div className="absolute right-2 bottom-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          All Photos (99)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile Thumbnails Grid - Below Main Image */}
              <div className="grid grid-cols-6 gap-2 mt-2 md:hidden">
                {mockCarData.images.map((image, index) => (
                  <div 
                    key={index}
                    className={`cursor-pointer rounded-md overflow-hidden h-16 ${index === activeImageIndex ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => selectImage(index)}
                  >
                    <img src={image} alt={`${mockCarData.title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Auction Info Bar */}
            <Card className="mb-6 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Time Left</div>
                        <div className="font-semibold">3 Days</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">High Bid</div>
                        <div className="font-semibold">$25,000</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Bids</div>
                        <div className="font-semibold">16</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MessageCircle size={18} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Comments</div>
                        <div className="font-semibold">25</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button 
                      className="w-3/4 sm:w-auto bg-green-500 hover:bg-green-600"
                    >
                      Place Bid
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-1/4 sm:w-auto"
                      onClick={handleContactClick}
                    >
                      <MessageCircle size={18} />
                      <span className="hidden md:inline ml-2">Contact</span>
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mt-4 text-right">
                  Ending May 14th at 1:30 PM EDT
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
                        <TableCell className="py-2">{mockCarData.details.make}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Model</TableCell>
                        <TableCell className="py-2">{mockCarData.details.model}</TableCell>
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
                        <TableCell className="py-2 font-medium text-gray-500">Seller</TableCell>
                        <TableCell className="py-2 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {mockCarData.seller.username.charAt(0)}
                          </div>
                          <span>{mockCarData.seller.username}</span>
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs underline text-blue-600" onClick={handleContactClick}>
                            Contact
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <Table>
                    <TableBody>
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
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Seller Type</TableCell>
                        <TableCell className="py-2">{mockCarData.details.sellerType}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </Card>
            
            {/* Seller Notes */}
            <Card className="mb-6 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-gray-500" />
                  <h2 className="text-lg font-bold">Seller's Notes</h2>
                </div>
                <p className="text-gray-700">{mockCarData.sellerNotes}</p>
              </CardContent>
            </Card>
            
            {/* Highlights */}
            <Card className="mb-6 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Highlights</h2>
                <ul className="list-disc pl-5 space-y-2">
                  {mockCarData.highlights.map((highlight, index) => (
                    <li key={index} className="text-gray-700">{highlight}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Description */}
            <Card className="shadow-sm mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{mockCarData.description}</p>
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
        carId={id || '1'}
        carTitle={mockCarData.title}
        sellerId={mockCarData.seller.id}
      />
    </div>
  );
};

export default CarDetails;
