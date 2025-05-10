
import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Share2, Heart, ChevronLeft, ChevronRight } from 'lucide-react';

// Mock data - in a real app this would come from an API
const mockCarData = {
  id: '1',
  title: 'F1 Race Car',
  price: '$25,000',
  images: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1487887235947-a955ef187fcc',
    'https://images.unsplash.com/photo-1500673922987-e212871fec22',
  ],
  description: 'This F1 race car is in excellent condition and ready for the track. It comes with a complete service history and has been maintained by professional mechanics.',
  details: {
    year: '2021',
    make: 'Formula',
    model: 'F1',
    mileage: '1,200 miles',
    location: 'FL Lauderdale, FL 33809',
    category: 'Open Wheel',
    subcategory: 'Formula 1',
  },
  seller: {
    name: 'John Smith',
    joinedDate: 'May 2023',
    listings: 5,
  }
};

const CarDetails = () => {
  const { id } = useParams();
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % mockCarData.images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + mockCarData.images.length) % mockCarData.images.length);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="relative rounded-lg overflow-hidden bg-gray-100 h-96 mb-4">
              <img 
                src={mockCarData.images[activeImageIndex]} 
                alt={mockCarData.title} 
                className="w-full h-full object-cover"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white/90"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white/90"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {mockCarData.images.map((image, index) => (
                <div 
                  key={index}
                  className={`cursor-pointer border-2 rounded-md overflow-hidden ${index === activeImageIndex ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={image} alt={`${mockCarData.title} thumbnail ${index + 1}`} className="w-24 h-16 object-cover" />
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{mockCarData.description}</p>
            </div>
          </div>

          {/* Car details and contact */}
          <div>
            <Card className="p-6">
              <h1 className="text-2xl font-bold mb-2">{mockCarData.title}</h1>
              <p className="text-3xl font-bold text-primary mb-4">{mockCarData.price}</p>
              
              <div className="flex gap-4 mb-6">
                <Button className="flex-1 flex justify-center gap-2">
                  <MessageCircle size={18} /> Contact Seller
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Year</span>
                  <span className="font-medium">{mockCarData.details.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Make</span>
                  <span className="font-medium">{mockCarData.details.make}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Model</span>
                  <span className="font-medium">{mockCarData.details.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mileage</span>
                  <span className="font-medium">{mockCarData.details.mileage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">{mockCarData.details.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subcategory</span>
                  <span className="font-medium">{mockCarData.details.subcategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-medium">{mockCarData.details.location}</span>
                </div>
              </div>

              <Separator className="my-4" />

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
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CarDetails;
