
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CarImageGalleryProps {
  images: string[];
  carName: string;
  isFeatured?: boolean;
}

const CarImageGallery = ({ images, carName, isFeatured = false }: CarImageGalleryProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Ensure we have a non-empty array of images and extract image URLs properly
  const validImages = images && images.length > 0 
    ? images.map((img: any) => typeof img === 'string' ? img : img.image_url)
    : ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'];
  
  console.log('Images received:', images);
  console.log('Processed image URLs:', validImages);
  
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

  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
    setIsLightboxOpen(true);
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    // Re-enable body scrolling
    document.body.style.overflow = '';
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Large Main Image */}
        <div className="relative rounded-lg overflow-hidden bg-gray-100 h-[400px] w-full cursor-pointer" onClick={() => openLightbox(activeImageIndex)}>
          <img 
            src={validImages[activeImageIndex]} 
            alt={carName} 
            className="w-full h-full object-cover"
          />
          {validImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
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
        
        {/* Thumbnails Grid */}
        {validImages.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {validImages.slice(0, 5).map((image, index) => (
              <div 
                key={index}
                className={`cursor-pointer rounded-md overflow-hidden h-[80px] ${index === activeImageIndex ? 'ring-2 ring-racecar-red' : ''}`}
                onClick={() => selectImage(index)}
              >
                <img src={image} alt={`${carName} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            onClick={closeLightbox}
          >
            <X size={28} />
          </button>
          
          <div className="relative w-full max-w-6xl max-h-full">
            <Carousel className="w-full">
              <CarouselContent>
                {validImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <AspectRatio ratio={16 / 9} className="bg-black flex items-center justify-center">
                      <img 
                        src={image} 
                        alt={`${carName} ${index + 1}`} 
                        className="max-h-[80vh] max-w-full object-contain"
                      />
                    </AspectRatio>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 bg-black/50 text-white hover:bg-black/70 border-none" />
              <CarouselNext className="right-4 bg-black/50 text-white hover:bg-black/70 border-none" />
            </Carousel>
            
            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              {activeImageIndex + 1} / {validImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarImageGallery;
