
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
  listingDetails?: React.ReactNode;
}

const CarImageGallery = ({ images, carName, isFeatured = false, listingDetails }: CarImageGalleryProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Ensure scrolling is always restored
  React.useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);
  
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
      {/* Responsive grid: Large image left, 4 small images right */}
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Main large image */}
        <div className="relative w-full lg:w-2/3 h-[320px] lg:h-[400px] rounded-lg overflow-hidden bg-gray-100 cursor-pointer" onClick={() => openLightbox(activeImageIndex)}>
          <img
            src={validImages[activeImageIndex]}
            alt={carName}
            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          />
          {/* Overlay listing details in top-right */}
          {listingDetails && (
            <div className="absolute top-2 right-2 text-right z-20 max-w-[75%]">
              <div className="text-white drop-shadow-lg text-base md:text-lg font-bold leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                {listingDetails}
              </div>
            </div>
          )}
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
        {/* 4 smaller images in 2x2 grid */}
        <div className="w-full lg:w-1/3 h-[320px] lg:h-[400px] grid grid-cols-2 grid-rows-2 gap-[2px] h-full w-full">

          {validImages.slice(0, 5).map((image, idx) => (
            idx === 0 ? null : (
              <div
                key={idx}
                className={`relative rounded-sm overflow-hidden bg-gray-100 cursor-pointer group aspect-square w-full h-full ${activeImageIndex === idx ? 'ring-2 ring-racecar-red' : ''}`}
                onClick={() => { selectImage(idx); openLightbox(idx); }}
              >
                <img
                  src={image}
                  alt={`${carName} alt ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Overlay index */}
                <span className="absolute bottom-1 right-2 bg-black/60 text-white text-xs rounded px-1 py-0.5 opacity-70">
                  {idx + 1}
                </span>
              </div>
            )
          ))}
          {/* Fill empty slots if fewer than 5 images */}
          {Array.from({ length: Math.max(0, 4 - (validImages.length - 1)) }).map((_, idx) => (
            <div key={`empty-${idx}`} className="rounded-sm bg-gray-100 border border-dashed border-gray-300 aspect-square w-full h-full" />
          ))}
        </div>
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
