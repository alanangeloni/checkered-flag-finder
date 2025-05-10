
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarImageGalleryProps {
  images: string[];
  carName: string;
  isFeatured?: boolean;
}

const CarImageGallery = ({ images, carName, isFeatured = false }: CarImageGalleryProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const nextImage = () => {
    if (images.length === 0) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const selectImage = (index: number) => {
    setActiveImageIndex(index);
  };

  return (
    <div className="mb-6">
      <div className="flex gap-4">
        {/* Large Main Image */}
        <div className="flex-grow">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 h-[500px] w-full">
            {images.length > 0 ? (
              <img 
                src={images[activeImageIndex]} 
                alt={carName} 
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
            {isFeatured && (
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
                <img src={image} alt={`${carName} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
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
              <img src={image} alt={`${carName} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarImageGallery;
