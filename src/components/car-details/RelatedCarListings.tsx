
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CarListingWithImages } from '@/types/customTypes';

interface RelatedCarListingsProps {
  listings: CarListingWithImages[];
  currentCarId: string | number;
}

const RelatedCarListings = ({ listings, currentCarId }: RelatedCarListingsProps) => {
  // Filter out the current car from the listings
  const filteredListings = listings.filter(listing => 
    String(listing.id) !== String(currentCarId)
  ).slice(0, 4); // Only show up to 4 related listings

  if (filteredListings.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">More Listings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredListings.map((car) => (
          <Card key={car.id} className="overflow-hidden">
            <div className="flex flex-col">
              <div className="relative h-36">
                {car.images && car.images.length > 0 ? (
                  <img 
                    src={car.images.find(img => img.is_primary)?.image_url || car.images[0].image_url} 
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No Image</p>
                  </div>
                )}
                {car.featured && (
                  <Badge 
                    className="absolute top-2 right-2 bg-racecar-red text-white"
                  >
                    FEATURED
                  </Badge>
                )}
              </div>
              <CardContent className="p-3">
                <Link to={`/car-details/${car.id}`} className="hover:text-racecar-red">
                  <h4 className="font-semibold text-sm truncate">{car.name}</h4>
                </Link>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-700 font-semibold">${car.price.toLocaleString()}</p>
                  <span className="text-xs text-gray-500">
                    {car.make} {car.model}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {car.year && <span className="text-xs text-gray-500">Year: {car.year}</span>}
                  {car.race_car_type && (
                    <>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{car.race_car_type}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedCarListings;
