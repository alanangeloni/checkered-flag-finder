
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarImageGalleryProps {
  images: string[];
  carName: string;
  isFeatured?: boolean;
}

const CarImageGallery = ({ images, carName, isFeatured = false }: CarImageGalleryProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Ensure we have a non-empty array of images
  const validImages = images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'];
  
  const nextImage = () => {
    if (validImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    if (validImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };
  
  const selectImage = (index: number) => {
    setActiveImageIndex(index);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Large Main Image */}
      <div className="flex-grow order-1">
        <div className="relative rounded-lg overflow-hidden bg-gray-100 h-[500px] w-full">
          <img 
            src={validImages[activeImageIndex]} 
            alt={carName} 
            className="w-full h-full object-cover"
          />
          {validImages.length > 1 && (
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
          {validImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs">
              {activeImageIndex + 1}/{validImages.length}
            </div>
          )}
        </div>
      </div>
      
      {/* Thumbnails Grid - Right Side Column */}
      {validImages.length > 1 && (
        <div className="md:order-2 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:w-[120px] md:h-[500px]">
          {validImages.slice(0, 6).map((image, index) => (
            <div 
              key={index}
              className={`cursor-pointer rounded-md overflow-hidden flex-shrink-0 w-[120px] h-[80px] ${index === activeImageIndex ? 'ring-2 ring-racecar-red' : ''}`}
              onClick={() => selectImage(index)}
            >
              <img src={image} alt={`${carName} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
          {validImages.length > 6 && (
            <div className="flex-shrink-0 w-[120px] h-[80px] rounded-md bg-black/70 text-white flex items-center justify-center text-sm">
              +{validImages.length - 6} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CarImageGallery;
