
import React from 'react';

const HeroSection = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="md:col-span-2">
          <img 
            src="/lovable-uploads/3ae15f6e-8212-4d24-91c3-686f370ddf43.png" 
            alt="Main race car" 
            className="rounded-md w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1518770660439-4636190af475" 
              alt="Race car detail" 
              className="rounded-md w-full h-full object-cover"
            />
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1518770660439-4636190af475" 
              alt="Race car detail" 
              className="rounded-md w-full h-full object-cover"
            />
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1518770660439-4636190af475" 
              alt="Race car detail" 
              className="rounded-md w-full h-full object-cover"
            />
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1518770660439-4636190af475" 
              alt="Race car detail" 
              className="rounded-md w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
