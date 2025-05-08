
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
            src="/lovable-uploads/3ae15f6e-8212-4d24-91c3-686f370ddf43.png" 
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
          <Carousel className="w-full">
            <CarouselContent>
              {[1, 2, 3, 4].map((item) => (
                <CarouselItem key={item} className="pl-0">
                  <img 
                    src={`https://images.unsplash.com/photo-${item === 1 ? '1533473861782-2a29b8ce2282' : item === 2 ? '1597939362269-8e2f21d5a8e7' : item === 3 ? '1525752898462-125aa0eb740a' : '1571607242263-541100261f8f'}`} 
                    alt={`Race car gallery ${item}`} 
                    className="rounded-md w-full h-48 object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-black/70 text-white hover:bg-black" />
            <CarouselNext className="right-2 bg-black/70 text-white hover:bg-black" />
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
