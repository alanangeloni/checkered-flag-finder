
import React from 'react';

const HeroSection = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Main large image */}
        <div className="md:w-3/5">
          <img 
            src="public/lovable-uploads/0350fe9c-4616-4a46-a751-6d4eabaead49.png" 
            alt="Premium race car on track" 
            className="rounded-md w-full aspect-square object-cover"
          />
        </div>
        
        {/* Right side content with info box and 4 smaller images */}
        <div className="md:w-2/5 space-y-4">
          <div className="bg-black rounded-md p-4 text-white">
            <h1 className="text-2xl font-bold mb-2">Find Your Dream Race Car</h1>
            <p className="text-gray-300 mb-4">Browse thousands of performance vehicles ready for the track.</p>
            <div className="flex gap-2">
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">Search Cars</button>
              <button className="bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-md">Sell Your Car</button>
            </div>
          </div>
          
          {/* 2x2 grid of smaller images */}
          <div className="grid grid-cols-2 gap-2 h-[calc(100%-132px)]">
            {/* Top row */}
            <div className="h-full">
              <img 
                src="https://images.unsplash.com/photo-1533473861782-2a29b8ce2282" 
                alt="Race car rear view" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
            <div className="h-full">
              <img 
                src="https://images.unsplash.com/photo-1597939362269-8e2f21d5a8e7" 
                alt="Race car side view" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
            
            {/* Bottom row */}
            <div className="h-full">
              <img 
                src="https://images.unsplash.com/photo-1525752898462-125aa0eb740a" 
                alt="Race car engine" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
            <div className="h-full">
              <img 
                src="https://images.unsplash.com/photo-1571607242263-541100f8f8f8" 
                alt="Race car cockpit" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
