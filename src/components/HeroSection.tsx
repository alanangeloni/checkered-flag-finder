
import React from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

const HeroSection = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <img 
            src="/lovable-uploads/c7335505-780b-4f50-b262-7dbbb7e8a4ac.png" 
            alt="Main race car" 
            className="rounded-md w-full h-full object-cover"
          />
        </div>
        <div className="space-y-4">
          <div className="bg-black rounded-md p-4 text-white">
            <h1 className="text-2xl font-bold mb-2">Find Your Dream Race Car</h1>
            <p className="text-gray-300 mb-4">Browse thousands of performance vehicles ready for the track.</p>
            <div className="flex gap-2">
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">Search Cars</button>
              <button className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-md">Sell Your Car</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1533473861782-2a29b8ce2282" 
                alt="Race car angle 1" 
                className="rounded-md w-full h-40 object-cover"
              />
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1597939362269-8e2f21d5a8e7" 
                alt="Race car angle 2" 
                className="rounded-md w-full h-40 object-cover"
              />
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1525752898462-125aa0eb740a" 
                alt="Race car engine" 
                className="rounded-md w-full h-40 object-cover"
              />
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1571607242263-541100f8f8f8" 
                alt="Race car cockpit" 
                className="rounded-md w-full h-40 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
