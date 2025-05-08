
import React from 'react';

const HeroSection = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Main large image */}
        <div className="md:w-3/5">
          <img 
            src="public/lovable-uploads/18c37c28-d61b-42ff-bd39-e4afa0cf3d33.png" 
            alt="Premium race car on track" 
            className="rounded-md w-full aspect-square object-cover"
          />
        </div>
        
        {/* Right side with 4 smaller images */}
        <div className="md:w-2/5 space-y-4">
          {/* 2x2 grid of smaller images */}
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Top row */}
            <div className="h-1/2">
              <img 
                src="https://images.unsplash.com/photo-1597516690807-65bfba6a1204" 
                alt="Race car angle view" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
            <div className="h-1/2">
              <img 
                src="https://images.unsplash.com/photo-1574697489276-12929b6571bd" 
                alt="Race car rear view" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
            
            {/* Bottom row */}
            <div className="h-1/2">
              <img 
                src="https://images.unsplash.com/photo-1581680395170-5e321f9f0a7e" 
                alt="Race car engine" 
                className="rounded-md w-full h-full object-cover"
              />
            </div>
            <div className="h-1/2">
              <img 
                src="https://images.unsplash.com/photo-1588127333419-b9d7de223dcf" 
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
