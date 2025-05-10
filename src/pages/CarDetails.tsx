
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

// Mock data - in a real app this would come from an API
const mockCarData = {
  id: '1',
  title: '2024 Porsche 911 GT3 Track Car',
  subtitle: '~200 Engine Hours, Track-Ready, Built for Performance',
  price: '$125,000',
  endingDate: 'May 14th at 1:30 PM EDT',
  images: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1487887235947-a955ef187fcc',
    'https://images.unsplash.com/photo-1500673922987-e212871fec22',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888',
  ],
  description: "This Porsche 911 GT3 race car is in excellent condition and ready for the track. It comes with a complete service history and has been maintained by professional mechanics.",
  details: {
    year: '2024',
    make: 'Porsche',
    model: '911 GT3',
    engineHours: '200 hours',
    engineSpecs: '4.0L Flat-6, 502hp',
    drivetrain: 'Rear-wheel drive',
    transmission: 'Sequential Racing Gearbox',
    raceCarType: 'GT3 Class',
    safetyEquipment: 'Full Roll Cage, Fire Suppression',
    suspension: 'Racing Coilovers, Adjustable',
    brakes: 'Carbon Ceramic, 6-piston',
    tires: 'Michelin Racing Slicks',
    weight: '2,800 lbs',
    location: 'FL Lauderdale, FL 33809',
    sellerType: 'Professional Race Team',
  },
  highlights: [
    'Track-ready GT3 class race car',
    'Professional racing history',
    'Recently serviced with new components',
    'Includes spare parts package',
    'Full documentation and race setup data'
  ],
  seller: {
    id: '123',
    name: 'Pro Racing Team',
    joinedDate: 'May 2023',
    listings: 5,
    username: 'mark82'
  },
  sellerNotes: "This Porsche 911 GT3 race car has been meticulously maintained and optimized for track performance. It features a full racing setup with adjustable suspension, race-spec brake system, and a comprehensive data logging system. The car has been used in professional GT3 events and comes with complete documentation including setup sheets and maintenance records. Ready to compete in GT3 class events or for serious track day enthusiasts who demand the highest level of performance."
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
                      className={`cursor-pointer rounded-md overflow-hidden h-[80px] ${index === activeImageIndex ? 'ring-2 ring-racecar-red' : ''}`}
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
                    className={`cursor-pointer rounded-md overflow-hidden h-16 ${index === activeImageIndex ? 'ring-2 ring-racecar-red' : ''}`}
                    onClick={() => selectImage(index)}
                  >
                    <img src={image} alt={`${mockCarData.title} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
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
                        <div className="font-semibold text-xl">{mockCarData.price}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Racing Class</div>
                        <div className="font-semibold">{mockCarData.details.raceCarType}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MessageCircle size={18} className="text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Team</div>
                        <div className="font-semibold">{mockCarData.seller.username}</div>
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
                  Listed on {mockCarData.endingDate}
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
                        <TableCell className="py-2 font-medium text-gray-500">Engine Hours</TableCell>
                        <TableCell className="py-2">{mockCarData.details.engineHours}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Engine Specs</TableCell>
                        <TableCell className="py-2">{mockCarData.details.engineSpecs}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Race Car Type</TableCell>
                        <TableCell className="py-2">{mockCarData.details.raceCarType}</TableCell>
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
                        <TableCell className="py-2 font-medium text-gray-500">Drivetrain</TableCell>
                        <TableCell className="py-2">{mockCarData.details.drivetrain}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Transmission</TableCell>
                        <TableCell className="py-2">{mockCarData.details.transmission}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Weight</TableCell>
                        <TableCell className="py-2">{mockCarData.details.weight}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Safety Equipment</TableCell>
                        <TableCell className="py-2">{mockCarData.details.safetyEquipment}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Suspension</TableCell>
                        <TableCell className="py-2">{mockCarData.details.suspension}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-2 font-medium text-gray-500">Brakes</TableCell>
                        <TableCell className="py-2">{mockCarData.details.brakes}</TableCell>
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
