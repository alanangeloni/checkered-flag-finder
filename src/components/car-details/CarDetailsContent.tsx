
import React from 'react';
import { Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarListingWithImages } from '@/types/customTypes';
import CarImageGallery from './CarImageGallery';
import CarPriceInfo from './CarPriceInfo';
import CarSpecifications from './CarSpecifications';
import CarDescription from './CarDescription';
import RelatedCarListings from './RelatedCarListings';

interface CarDetailsContentProps {
  carListing: CarListingWithImages;
  images: string[];
  relatedListings: CarListingWithImages[];
  id: string;
  onContactClick: () => void;
}

const CarDetailsContent = ({
  carListing,
  images,
  relatedListings,
  id,
  onContactClick
}: CarDetailsContentProps) => {
  return (
    <>
      {/* Title and subtitle */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">{carListing?.name}</h1>
        <p className="text-gray-600">{carListing?.short_description}</p>
      </div>
      
      {/* Main content area - Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Car details (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          {/* Image Gallery Component */}
          <CarImageGallery 
            images={images} 
            carName={carListing?.name || ''} 
            isFeatured={carListing?.featured || false} 
          />
          
          {/* Car Details Components - Below Images */}
          <div className="mt-6">
            {/* Price and Contact Info Component */}
            <CarPriceInfo 
              price={carListing?.price || 0}
              raceCarType={carListing?.race_car_type}
              sellerType={carListing?.seller_type}
              createdAt={carListing?.created_at || new Date().toISOString()}
              onContactClick={onContactClick}
            />
            
            {/* Vehicle Specifications Component */}
            <CarSpecifications carListing={carListing} />
            
            {/* Description Component */}
            <CarDescription 
              detailedDescription={carListing?.detailed_description}
              shortDescription={carListing?.short_description}
              raceCarType={carListing?.race_car_type}
              categoryName={carListing?.category_name}
              subcategoryName={carListing?.subcategory_name}
            />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end mb-6">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Right column - Related listings (1/3 width on large screens) */}
        <div className="lg:col-span-1">
          <RelatedCarListings listings={relatedListings} currentCarId={id} />
        </div>
      </div>
    </>
  );
};

export default CarDetailsContent;
