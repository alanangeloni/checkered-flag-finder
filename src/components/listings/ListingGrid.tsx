
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import ListingCard from './ListingCard';
import NoResults from './NoResults';

interface Listing {
  id: number;
  title: string;
  price: number;
  location?: string;
  mileage: number;
  image: string;
  category?: string;
  subcategory?: string;
}

interface ListingGridProps {
  isLoading: boolean;
  listings: Listing[];
  filteredListings: Listing[];
  resetFilters: () => void;
}

const ListingGrid: React.FC<ListingGridProps> = ({
  isLoading,
  listings,
  filteredListings,
  resetFilters
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Loading car listings...</p>
      </div>
    );
  }

  // No results found
  if (filteredListings.length === 0) {
    return <NoResults resetFilters={resetFilters} />;
  }

  // Show listings
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {listings.map(car => (
        <ListingCard key={car.id} car={car} />
      ))}
    </div>
  );
};

export default ListingGrid;
